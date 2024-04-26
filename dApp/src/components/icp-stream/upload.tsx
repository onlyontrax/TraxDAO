/* eslint-disable no-await-in-loop */
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { manager } from '../../smart-contracts/declarations/manager';
// import { idlFactory as fanBucketIDL } from '../../smart-contracts/declarations/fan_bucket/fan_bucket.did.js';
import { idlFactory as artistBucketIDL } from '../../smart-contracts/declarations/artist-account-bucket/service.did.js';
import { idlFactory as artistContentBucketIDL } from '../../smart-contracts/declarations/artist-content-bucket/service.did.js';
import { ContentInit } from '../../smart-contracts/declarations/artist-content-bucket/service2.did';

import {
  getFileExtension, b64toBlob, encodeArrayBuffer, getReverseFileExtension
} from './utils';

const MAX_CHUNK_SIZE = 1024 * 500; // 500kb
// const REWARDS_CHECK_INTERVAL = 60000;
// const hashtagRegExp = /(?:\s|^)#[A-Za-z0-9\-._]+(?:\s|$)/gim;

// FLOW OF SC INTERACTION

// 1. Create artist account canister first by calling createProfileArtist() if the artist hasnt already initiated one.
//    You can check if an artist has by calling getMyCanisterIDArtist().

// 2. Choose file to upload. When a file is chosen, handleFileChange() function is called which converts the file into Blob format ready for upload.

// 3. Calling upload() will initiate the call to the smart contract to scan for free canister space.
//    Once space is found the processAndUploadChunk() function will be called, beginning upload process.

// 4. Call downloadFile() function to begin download process.

// *****************************************************
// ***** INITIALISE NEW ACCOUNT CANISTER FUNCTIONS *****
// *****************************************************

export const createBucketActor = async ({ idl, canisterId }) => {
  const agent = new HttpAgent();

  // if (process.env.NODE_ENV !== 'production') {
  await agent.fetchRootKey();
  // }

  return Actor.createActor(idl, {
    agent,
    canisterId
  });
};

const initCanister = async (bucket, type) => {
  try {
    let actor;
    if (type === 'artist') {
      actor = await createBucketActor({
        idl: artistBucketIDL,
        canisterId: bucket
      });
    } else {
      actor = await createBucketActor({
        idl: artistBucketIDL, // remember to set it back to fanBucketIDL,
        canisterId: bucket
      });
    }

    const res = await actor.initCanister();
  } catch (err) {
    console.error(err);
  }
};

export const createProfileArtist = async (artistId: Principal) => {
  const artistAccountData = {
    createdAt: BigInt(Number(Date.now() * 1000)),
    userPrincipal: artistId
  };

  try {
    const bucket = await manager.createProfileArtist(artistAccountData);
    // registeredBuckets.push(bucket.toString());

    await initCanister(bucket, 'artist');
  } catch (err) {
    console.error(err);
  }
};

// *************************************
// ***** UPLOAD/DOWNLOAD FUNCTIONS *****
// *************************************

interface FileReaderInfo {
  name: string;
  type: string;
  size: number;
  blob: Blob;
  width: number;
  file: number;
  height: number;
}

let fileType: FileReaderInfo;

export const handleFileChange = (event: any) => {
  const file = event.target.files[0];
  // Make new FileReader
  const reader = new FileReader();
  // Convert the file to base64 text
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    if (reader.result === null) {
      throw new Error('file empty...');
    }
    let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
    if ((encoded.length % 4) > 0) {
      encoded += '='.repeat(4 - (encoded.length % 4));
    }
    const blob = b64toBlob(encoded, file.type);

    fileType = { // FILE READER INFO
      name: file.name,
      type: file.type,
      size: file.size,
      blob,
      file,
      width: file.width,
      height: file.height
    };
  };
};

const processAndUploadChunk = async (
  blob: Blob,
  byteStart: number,
  fileId: string,
  chunk: number,
  fileSize: number,
  canisterId: Principal
): Promise<any> => {
  const blobSlice = blob.slice(
    byteStart,
    Math.min(Number(fileSize), byteStart + MAX_CHUNK_SIZE),
    blob.type
  );

  const bsf = await blobSlice.arrayBuffer();
  const actor = await createBucketActor({
    idl: artistContentBucketIDL,
    canisterId: canisterId.toString()
  });

  return actor.putContentChunk(fileId, BigInt(chunk), encodeArrayBuffer(bsf));
};

export const upload = async (artistId: Principal) => {
  const fileExtension = getFileExtension(fileType.type);
  const errors = [];
  if (fileType === null || fileType === undefined || fileExtension === null) {
    errors.push('File not valid!');
  }
  if (fileType.size > 10550000) {
    errors.push("File size shouldn't be bigger than 10mb");
  }

  const t0 = performance.now();

  const canisterId = await manager.getCanisterArtist(artistId);

  const randomContentID = Math.random().toString(36).substring(2); // temporary var. Actual implementation should use content ID generated by backend

  const fileInfo: ContentInit = {
    name: fileType.name,
    createdAt: BigInt(Number(Date.now() * 1000)),
    size: BigInt(fileType.size),
    description: 'Something',
    tags: ['hiphop', 'dance', 'grime'],
    chunkCount: BigInt(Number(Math.ceil(fileType.size / MAX_CHUNK_SIZE))),
    extension: fileExtension,
    userId: artistId,
    contentId: randomContentID
  };

  // const thumbnail = {
  //   contentId: randomContentID,
  //   userId: Principal.fromText(userId.value),
  //   name: fileType.name + " thumbnail",
  //     chunkCount: BigInt(Number(Math.ceil(fileType.size / MAX_CHUNK_SIZE))),
  //     extension: fileExtension,
  //     size: Nat;
  //     file: '',

  //   size:
  // }

  const actor = await createBucketActor({
    idl: artistBucketIDL,
    canisterId: canisterId.toString()
  });

  const response = await actor.createContent(fileInfo);
  const { blob } = fileType;
  const putChunkPromises = [];
  let chunk = 1;
  for (let byteStart = 0; byteStart < fileType.size; byteStart += MAX_CHUNK_SIZE, chunk += 1) {
    putChunkPromises.push(
      processAndUploadChunk(blob, byteStart, response[0][0], chunk, fileType.size, response[0][1])
    );
  }

  await Promise.all(putChunkPromises);

  const t1 = performance.now();
};

export const downloadFile = async (userPrincipal: Principal, contentId: string) => {
  const artistAccountCanister = await manager.getCanisterArtist(userPrincipal);
  const accountBucket = await createBucketActor({
    idl: artistBucketIDL,
    canisterId: artistAccountCanister.toString()
  });

  const artistContentCanister = await accountBucket.getCanisterOfContent(contentId);
  const contentBucket = await createBucketActor({
    idl: artistContentBucketIDL,
    canisterId: artistContentCanister.toString()
  });

  const contentData = await contentBucket.getContentInfo(userPrincipal, contentId);

  const chunks = [];
  for (let i = 1; i <= Number(contentData[0].chunkCount); i += 1) {
    const chunk = await contentBucket.getContentChunk(contentId, BigInt(i));
    if (chunk[0]) {
      chunks.push(new Uint8Array(chunk[0]).buffer);
    }
  }

  const blob = new Blob(chunks, { type: getReverseFileExtension(contentData[0].extension) });
  const url = URL.createObjectURL(blob);

  // *** TODO: Add streaming functionality
};

// ****************************
// ***** GETTER FUNCTIONS *****
// ****************************

export const getProfileInfoArtist = async (artistId: Principal) => {
  const canId = await manager.getCanisterArtist(artistId);

  try {
    const actor = await createBucketActor({
      idl: artistBucketIDL,
      canisterId: canId.toString()
    });

    const res = await actor.getProfileInfo(artistId);
  } catch (err) {
    console.error(err);
  }
};

export const getMyCanisterID = async (fan: Principal) => {
  try {
    const res = await manager.getCanisterFan(fan);
  } catch (error) {
    console.log(error);
  }
};

export const getOwnerOfCanisterId = async (canID: Principal) => {
  try {
    const res = await manager.getOwnerOfFanCanister(canID);
  } catch (error) {
    console.log(error);
  }
};

export const getMyCanisterIDArtist = async (artist: Principal) => {
  try {
    const res = await manager.getCanisterArtist(artist);
  } catch (error) {
    console.log(error);
  }
};

export const getOwnerOfCanisterIdArtist = async (canID: Principal) => {
  try {
    const res = await manager.getOwnerOfArtistCanister(canID);
  } catch (error) {
    console.log(error);
  }
};

// const createFanProfile = async () => {
//   let username = document.getElementById('username');
//   let displayName = document.getElementById('displayName');
//   let userPrincipal = document.getElementById('principal');
//   // let gender = document.getElementById('gender');
//   let emailAddress = document.getElementById('email');
//   let lastName = document.getElementById('lastName');
//   let firstName = document.getElementById('firstName');

//   let fanAccountData = {
//     firstName: firstName.value,
//         lastName: lastName.value,
//         userPrincipal: Principal.fromText(userPrincipal.value),
//         username: username.value,
//         displayName: displayName.value,
//         emailAddress: emailAddress.value,
//   }
//   try {
//     bucket = await manager.createProfileFan(fanAccountData);
//     console.log('New bucket:', bucket.toText());
//     registeredBuckets.push(bucket.toString());
//     let connected = document.querySelector("#connectCanID");
//     connected.value = bucket;
//     await initCanister(bucket, "fan");
//   } catch (err) {
//     console.error(err);
//   }
// };

// export const transferOwner = async(owner: Principal, newOwner: Principal) => {

//   let canId = await manager.getCanisterFan(owner);
//   try {
//     const actor = await createBucketActor({
//       idl: fanBucketIDL,
//       canisterId: canId.toString()
//     });
//     await manager.transferOwnershipFan(owner, newOwner);
//     let res = await actor.transferOwnership(owner, newOwner);
//     console.log(res);

//   } catch (err) {
//     console.error(err);
//   }
// }

// export const getProfileInfo = async(fanId: Principal) =>{

//   let canId = await manager.getCanisterFan(fanId)
//   console.log(canId.toString());

//   // let connected = document.querySelector("#connectCanID");
//   // console.log(connected.value);

//   try {
//     const actor = await createBucketActor({
//       idl: fanBucketIDL,
//       canisterId: canId.toString()
//     });
//     let res = await actor.getProfileInfo(fanId);

//     console.log(res[0]);
//     // console.log(res);

//   } catch (err) {
//     console.error(err);
//   }
// }

// export const updateProfile = async () =>{
//   let principal = document.querySelector('#getInfoPrince')
//   let canId = await manager.getCanisterFan(Principal.fromText(principal.value))
//   console.log(canId.toString());

//   let username = document.getElementById('usernameP');
//   let displayName = document.getElementById('displayNameP');
//   let userPrincipal = document.getElementById('principalP');
//   // let gender = document.getElementById('gender');
//   let emailAddress = document.getElementById('emailP');
//   let lastName = document.getElementById('lastNameP');
//   let firstName = document.getElementById('firstNameP');

//   let newFanAccountData = {
//       firstName: firstName.value,
//       lastName: lastName.value,
//       userPrincipal: Principal.fromText(userPrincipal.value),
//       username: username.value,
//       displayName: displayName.value,
//       emailAddress: emailAddress.value,
//   }
// try {
//     const actor = await createBucketActor({
//       idl: fanBucketIDL,
//       canisterId: canId.toString()
//     });
//     console.log(await actor.updateProfileInfo(newFanAccountData.userPrincipal, newFanAccountData));
//   } catch (err) {
//     console.error(err);
//   }

// }

// export const updateProfileArtist = async () =>{
//   let principal = document.querySelector('#getInfoPrinceA');
//   let canId = await manager.getCanisterArtist(Principal.fromText(principal.value))
//   console.log(canId.toString());

// try {
//     const actor = await createBucketActor({
//       idl: artistBucketIDL,
//       canisterId: canId.toString()
//     });
//     console.log(await actor.updateProfileInfo(newArtistAccountData.userPrincipal, newArtistAccountData));
//   } catch (err) {
//     console.error(err);
//   }

// }

// const getThisPrincipal = async () =>{

//   let connected = document.querySelector("#connectCanID")

//   try {
//     const actor = await createBucketActor({
//       idl: artistBucketIDL,
//       canisterId: connected.value
//     });
//     console.log("ACTOR: " + actor);

//     let res = await actor.getPrincipalThis();
//     console.log("RES: " + res)
//     console.log("BUCKET: " + bucket)
//   } catch (err) {
//     console.error(err);
//   }
// }

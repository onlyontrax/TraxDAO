
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import {Principal} from '@dfinity/principal';
import {
  createActor as createNftActor, canisterId as NftCanisterId
} from 'src/smart-contracts/declarations/traxNFT';

export class NftService {
  getArtistNfts(artist_nfid: string) {
    return new Promise(async (resolve) => {
      let identity, host, agent, nftActor;
      const authClient = await AuthClient.create();


      if ((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic') {
        host = process.env.NEXT_PUBLIC_HOST_LOCAL as string;
        agent = new HttpAgent({
          host
        });
  
        await agent.fetchRootKey();
        nftActor = await createNftActor(process.env.NEXT_PUBLIC_NFT_CANISTER_ID, {
          agent
        });

        let principal = Principal.fromText(artist_nfid);
        let data = await nftActor.getArtistNfts(principal);
        let nfts = [];
        for (let item of data) {
          let id = item[0];
          let type = item[1];
          let metadata;
          if (type === 'song') {
            metadata = await nftActor.getSongMetadata(id);
          }
          else {
            metadata = await nftActor.getTicketMetaData(id);
          }
          nfts.push({...metadata[0], type});
        }
        resolve(nfts);
      } else {
        host = process.env.NEXT_PUBLIC_HOST as string;
        identity = await authClient.getIdentity();
        agent = new HttpAgent({
          identity,
          host
        });

        nftActor = createNftActor(NftCanisterId, {
          agent
        });
      }
    });
  }
  getNft(nft_id: string) {
    return new Promise(async (resolve) => {
      let identity, host, agent, nftActor;

      if ((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic') {
        host = process.env.NEXT_PUBLIC_HOST_LOCAL as string;
        agent = new HttpAgent({
          host
        });
        await agent.fetchRootKey();
        nftActor = await createNftActor(process.env.NEXT_PUBLIC_TRAXNFT_CANISTER_ID, {
          agent
        });
        let data = await nftActor.getNFT(nft_id);
        let type = data[0].productType;
        let metadata;
        if (type === 'song') {
          metadata = await nftActor.getSongMetadata(nft_id);
        }
        else {
          metadata = await nftActor.getTicketMetaData(nft_id);
        }
        resolve({
          ...metadata[0],
          type
        });
      } else {
        host = process.env.NEXT_PUBLIC_HOST as string;
        agent = new HttpAgent({
          host
        });

        nftActor = createNftActor(NftCanisterId, {
          agent
        });
      }
    });
  }
}

export const nftService = new NftService();
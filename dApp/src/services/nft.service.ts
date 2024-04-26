
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from '@dfinity/principal';
import {
  createActor as createNftActor, canisterId as NftCanisterId
} from 'src/smart-contracts/declarations/traxNFT';
import { idlFactory as idlFactoryTraxNFT } from '../smart-contracts/declarations/traxNFT/traxNFT.did.js';
import type { _SERVICE as _SERVICE_TRAX_NFT } from '../smart-contracts/declarations/traxNFT/traxNFT2.did';

export class NftService {
  getArtistNfts(artist_nfid: string, settings: any) {
    return new Promise(async (resolve) => {
      let identity, agent, nftActor;
      const host = settings.icHost;
      const authClient = await AuthClient.create();

      if (!artist_nfid || typeof artist_nfid === 'undefined') {
        resolve([]);
        return;
      }

      if (settings.icNetwork !== true) {
        agent = new HttpAgent({
          host
        });
  
        await agent.fetchRootKey();

        nftActor = Actor.createActor<_SERVICE_TRAX_NFT>(idlFactoryTraxNFT, {
          agent,
          canisterId: settings.icNFT
        });
        const principal = Principal.fromText(artist_nfid);

        if (typeof principal === 'undefined') {
          resolve([]);
          return;
        }

        const data = await nftActor.getArtistNfts(principal);
        const nfts = [];
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
        identity = await authClient.getIdentity();
        agent = new HttpAgent({
          identity,
          host
        });

        nftActor = Actor.createActor<_SERVICE_TRAX_NFT>(idlFactoryTraxNFT, {
          agent,
          canisterId: settings.icNFT
        });
      }
    });
  }
  getNft(nft_id: string, settings: any) {
    return new Promise(async (resolve) => {
      let identity, agent, nftActor;
      const host = settings.icHost;

      if (settings.icNetwork !== true) {
        agent = new HttpAgent({
          host
        });
        await agent.fetchRootKey();
        nftActor = Actor.createActor<_SERVICE_TRAX_NFT>(idlFactoryTraxNFT, {
          agent,
          canisterId: settings.icNFT
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
        agent = new HttpAgent({
          host
        });

        nftActor = Actor.createActor<_SERVICE_TRAX_NFT>(idlFactoryTraxNFT, {
          agent,
          canisterId: settings.icNFT
        });
      }
    });
  }
}

export const nftService = new NftService();
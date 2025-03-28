import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import { performerService, videoService } from '@services/index';

const CollaboratorList = ({ video, isFromRelatedList }) => {
  const [participants, setParticipants] = useState(video?.participants || []);
  const performer = video?.performer;
  const [fetchedParticipants, setFetchedParticipants] = useState({
    [performer?._id.toString()]: performer,
  });


  useEffect(() => {
    const fetchParticipants = async () => {
      if (isFromRelatedList) {
        let participants = [];
        for (const id of video.participantIds) {
          const participantId = id.toString();
          if (fetchedParticipants[participantId]) {
            participants.push(fetchedParticipants[participantId]);
          } else {
            try {
              const resp = await performerService.findOne(id);
              const fetchedParticipant = resp.data;

              setFetchedParticipants((prev) => ({
                ...prev,
                [participantId]: fetchedParticipant,
              }));

              participants.push(fetchedParticipant);
            } catch (error) {
              console.error(`Error fetching participant with id ${participantId}:`, error);
            }
          }
        }
        setParticipants(participants)
        // Do something with participants array if needed
      } else {
        // Other logic
      }
    };

    fetchParticipants().catch(error => {
      console.error('Error fetching participants:', error);
    });
  }, []);

  if (participants?.length > 0) {
    return (
      <div className="flex flex-nowrap items-center overflow-hidden">
        {participants?.map((artist, index) => (
          <div
            key={artist._id}
            className={`text-sm font-light mb-0 inline-flex ${isFromRelatedList ? 'text-[#848586]' : 'text-custom-green'} hover:text-trax-white`}
          >
            {index !== 0 && (
              <Link href={`/${artist?.username || artist?._id}`} className={`mr-1 ${isFromRelatedList ? 'text-[#848586]' : 'text-custom-green'}`}>
                {','}
              </Link>
            )}
            <Link
              href={`/${artist?.username || artist?._id}`}
              className={`"w-full ${isFromRelatedList ? 'text-[#848586] flex items-center' : 'text-custom-green'} hover:text-trax-white"`}
            >
              <span className={`${isFromRelatedList ? 'text-[#848586]' : 'text-custom-green'} whitespace-nowrap hover:text-trax-white`}>{artist.name}</span>
            </Link>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Link
      href={`/${performer?.username || performer?._id}`}
      className={`w-full ${isFromRelatedList ? 'text-[#848586] flex items-center' : 'text-custom-green'} whitespace-nowrap hover:text-trax-white`}
    >
      <span className={`${isFromRelatedList ? 'text-[#848586]' : 'text-custom-green'}  inline-flex whitespace-nowrap text-sm  font-light hover:text-trax-white`}>
        {performer?.name || 'N/A'}
      </span>
    </Link>
  );
};

export default CollaboratorList;
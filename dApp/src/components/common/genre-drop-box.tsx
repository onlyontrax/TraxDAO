
import React, { useEffect, useId, useRef, useState } from "react";
import { performerService, utilsService, videoService } from 'src/services';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useOutsideClick } from "@components/ui/use-outside-click";



export const MultiColumnDropdown = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chunks, setChunks] = useState(null);
  const [tags, setTags] = useState([]);
  const [active, setActive] = useState<(typeof isOpen)>(null);

  const ref = useRef<HTMLDivElement>(null);
  // const [selectedGenre, setSelectedGenre] = useState('featured');

  useEffect(() => {

    async function getData(){
        try {
            const [ musicInfo] = await Promise.all([utilsService.musicInfo()]);
            let _tags = musicInfo?.data.activeTags.data;
            setTags(_tags);
            let chunkSize = 8;
            const _chunks = [];
            if(props.isMobile){
              _tags.splice(1, 1)
            }

            for (let i = 0; i < _tags.length; i += chunkSize) {
                _chunks.push(_tags.slice(i, i + chunkSize));
            }

            setChunks(_chunks);

          } catch (e) {
            setTags(null)
          }
    }

    getData();
  }, []);


  useOutsideClick(ref, () => setIsOpen(null));


  const handleGenreSelect = (value: string) =>{
    setIsOpen(false);
    props.onSelect(value)

  }





//   // Function to chunk the array into sub-arrays of 5 items each
//   const chunkArray = (array, chunkSize) => {
//     console.log(array)
//     const chunks = [];
//     for (let i = 0; i < array.length; i += chunkSize) {
//       chunks.push(array.slice(i, i + chunkSize));
//     }
//     return chunks;
//   };

//   const chunks = chunkArray(items, 5);

  return (
    <div  className="dropdown-container">
      <button
        onMouseEnter={()=>setIsOpen(true)}
        className="dropdown-toggle rounded-full py-2 px-4 sm:p-0"
        style={{
          color: props.selectedGenre === 'featured' || (props.selectedGenre === 'new' && props.isMobile) ? '#B3B3B3' : '#ffffff',
          border: props.isMobile ? props.selectedGenre === 'featured' || (props.selectedGenre === 'new' && props.isMobile) ? '1px solid #B3B3B3' : '1px solid #ffffff' : 'none'}}>

        <span className="hover:text-trax-white transition-all">
          {(props.selectedGenre === 'featured' || props.selectedGenre === '' || (props.selectedGenre === 'new' && props.isMobile)) ? 'Genres' : props.selectedGenre}
        </span>
        <ChevronDownIcon className=' mt-[6px]' width={13} height={13}/>
      </button>
      {isOpen && (
        <div ref={ref} className="dropdown-menu" onMouseLeave={()=>setIsOpen(false)}>
          {chunks.map((chunk, index) => (
            <div key={index} className="dropdown-column">
              {chunk.map((item, idx) => (
                <div key={idx} className="dropdown-item" style={{background: props.selectedGenre === item.value && '#2f2f2fbd' }} onClick={()=> handleGenreSelect(item.value)}>
                  {item.value}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

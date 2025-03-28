import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { utilsService } from 'src/services';
import { useOutsideClick } from "@components/ui/use-outside-click";
import Modal from '@components/common/new-modal';
import { GENRES } from 'src/constants';
import DropdownModal from "./base/drop-down-modal";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";


const sortAndReorderTags = (tags) => {
  tags.sort((a, b) => a.value.localeCompare(b.value));

  console.log(tags)
  
  const moveTagToFront = (tagValue) => {
    const index = tags.findIndex(tag => tag.value === tagValue);
    if (index !== -1) {
      const [tag] = tags.splice(index, 1);
      tags.unshift(tag);
    }
  };

  const removeTag = (tagValue) => {
    const index = tags.findIndex(tag => tag.value === tagValue);
    if (index !== -1) {
      tags.splice(index, 1);
    }
  };
  
  removeTag('homepage');
  removeTag('featuredVideoOne');
  removeTag('traxOriginal');
  removeTag('recommendedTrack');
  removeTag('popularTrack');
  moveTagToFront('new');
  moveTagToFront('featured');

  return tags;
};

const DropdownItem = ({ item, isSelected, onClick, isMobile }) => (
  <div
    className={`dropdown-item-desktop group relative ${
      isSelected ? 'bg-[#000000] border-1 border-custom-green text-custom-green' : ''
    }`}
    onClick={() => onClick(item.value)}
  >
    {item.text}
    <div className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100 bg-[#414141B2] rounded-lg">
      <ChevronRightIcon className="w-9 h-9 text-custom-green" />
    </div>
  </div>
);

const DropdownContent = ({ items, selectedGenre, handleGenreSelect, isMobile }) => (
  <div className='dropdown-column-desktop p-4 pb-6'>
    {items.map((item) => (
      <DropdownItem
        key={item.value}
        item={item}
        isSelected={selectedGenre === item.value}
        onClick={handleGenreSelect}
        isMobile={isMobile}
      />
    ))}
  </div>
);

export const MultiColumnDropdown = ({ isMobile, onSelect, selectedGenre }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useOutsideClick(ref, () => setIsOpen(false));

  useEffect(() => {
    // console.log(GENRES.find(genre => genre.value === selectedGenre)?.text || 'dunno')

    const fetchData = async () => {
      try {
        const musicInfo = await utilsService.musicInfo();
        let tags = musicInfo?.data.activeTags.data || [];
        
        tags = sortAndReorderTags(tags);
        setItems(tags);
      } catch (e) {
        console.error("Error fetching music info:", e);
        setItems([]);
      }
    };

    fetchData();
  }, []);

  const handleGenreSelect = (value) => {
    setIsOpen(false);
    onSelect(value);
  };

  const isDefaultGenre = selectedGenre === 'featured' || selectedGenre === '';

  return (
    <>
      <div className={` ${!isMobile && selectedGenre !== 'featured' && 'bg-[#ffffff20] backdrop-blur-2xl'} dropdown-container`}>
        <button
          onClick={() => setIsOpen(true)}
          className={`dropdown-toggle rounded-lg py-[6px] px-4 sm:p-0 
            ${isDefaultGenre ? 'text-trax-gray' : 'text-trax-white'}
            ${isMobile ? 'bg-[#ffffff20] backdrop-blur hover:bg-[#ffffff4d]  transition rounded-lg nav-link' : ''}`}
        >
          <span className="hover:text-trax-white transition-all whitespace-nowrap capitalize">
            {isDefaultGenre ? 'Genres' : GENRES.find(genre => genre.value === selectedGenre)?.text || selectedGenre}
          </span>
          <ChevronDown className="mt-[5px] genre-chevron-down stroke-2" width={15} height={15}/>
        </button>
      </div>
      <DropdownModal isOpen={isOpen} onClose={() => setIsOpen(false)} isMobile={isMobile} isNavigation={false}>
        <DropdownContent
          items={items}
          selectedGenre={selectedGenre}
          handleGenreSelect={handleGenreSelect}
          isMobile={isMobile}
        />
      </DropdownModal>
    </>
  );
};
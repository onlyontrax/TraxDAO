import { PureComponent } from 'react';
import { ICountry, IPerformer } from 'src/interfaces';
import {
  InstagramOutlined, TwitterOutlined
} from '@ant-design/icons';
import { GrSoundcloud, GrSpotify } from 'react-icons/gr';
import { SiApplemusic } from 'react-icons/si';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faSoundcloud, faXTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons'
interface IProps {
  performer: IPerformer;
  countries: ICountry[];
}

export class PerformerInfo extends PureComponent<IProps> {
  state={
    isDesktop: false
  }

  async componentDidMount() {
    this.setState({ isDesktop: window.innerWidth > 769 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isDesktop: window.innerWidth > 769 });
  };

  render() {
    const { performer, countries = [] } = this.props;
    const country = countries.length && countries.find((c) => c.code === performer?.country);
    const { isDesktop } = this.state;

    return (
      <div className="per-infor">

        <div className="about-header-stats">
          <div className="about-stats">
            
            <h3 style={{ color: performer?.themeColor || '#A8FF00' }}>Artist score</h3>
            <span style={{ color: performer?.themeColor || '#A8FF00' }}>{performer.score}</span>
          </div>
        </div>
        <div className="artist-info-links">

          <div className="location flex flex-row mt-6 mb-2">
            <div className="location-wrapper-1 flex">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" style={{ width: '24px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div className="location-wrapper-2 flex">
              <p style={{ display: 'inline-flex', color:'#F2F2F2' }}>
                &nbsp;
                {country?.name}
              </p>
            </div>
          </div>
          <div />

          <div className="flex text-white">
            <div className="social-links flex flex-col gap-y-4 mt-2 text-white">
              {performer.spotify && performer.spotify.length > 10 && (
              <a className='flex items-center gap-3 text-white flex-row' target="_blank" href={performer.spotify}>

                <GrSpotify className='fill-[#F2F2F2] h-6 w-6'/>
                {' '}
                <span className="socials-label text-[#B3B3B3]">Spotify</span>

              </a>
              )}
              {performer.appleMusic && performer.appleMusic.length > 10 && (
              <a className="flex items-center gap-3 text-white flex-row" target="_blank" href={performer.appleMusic}>

                <SiApplemusic className='fill-[#F2F2F2] h-6 w-6'/>
                {' '}
                <span className="socials-label text-[#B3B3B3]">Apple Music</span>

              </a>
              )}
              {performer.soundcloud && performer.soundcloud.length > 10 && (
              <a className="flex items-center gap-3 text-white flex-row" target="_blank" href={performer.soundcloud}>

              <FontAwesomeIcon icon={faSoundcloud} className='text-[#F2F2F2] h-6 w-6'/>
                {' '}
                <span className="socials-label text-[#B3B3B3]">Soundcloud</span>

              </a>
              )}
              {performer.instagram && performer.instagram.length > 10 && (
              <a className="flex flex-row items-center gap-3 text-white" target="_blank" href={performer.instagram}>

                <InstagramOutlined className='text-[#F2F2F2] text-2xl' />
                {' '}
                <span className="socials-label text-[#B3B3B3]">Instagram</span>

              </a>
              )}
              {performer.twitter && performer.twitter.length > 10 && (
              <a className="flex flex-row items-center gap-3 text-white" target="_blank" href={performer.twitter}>

                <TwitterOutlined className='text-[#F2F2F2] text-2xl'/>
                {' '}
                <span className="socials-label text-[#B3B3B3]">Twitter</span>

              </a>
              )}
            </div>
          </div>
          <div className="genre-tags-wrapper" style={{ display: `${!performer.genreOne && !performer.genreTwo && !performer.genreThree && !performer.genreFour && !performer.genreFive ? 'none' : 'flex'}` }}>
            <div className="genre-tags">
              <div className="genre-row">
                {performer?.genreOne && (
                  <div className="genre-val" style={{ display: `${performer.genreOne === 'Unset' || !performer.genreOne ? 'none' : 'block'}` }}>
                    {performer?.genreOne}
                  </div>
                )}
                {performer?.genreTwo && (
                  <div className="genre-val" style={{ display: `${performer.genreTwo === 'Unset' || !performer.genreOne ? 'none' : 'block'}` }}>
                    {performer.genreTwo}
                  </div>
                )}
              </div>
              <div className="genre-row">
                {performer?.genreThree && (
                  <div className="genre-val" style={{ display: `${performer.genreThree === 'Unset' || !performer.genreOne ? 'none' : 'block'}` }}>
                    {performer.genreThree}
                  </div>
                )}
                {performer?.genreFour && (
                  <div className="genre-val" style={{ display: `${performer.genreFour === 'Unset' || !performer.genreOne ? 'none' : 'block'}` }}>
                    {performer.genreFour}
                  </div>
                )}
              </div>
              <div className="genre-row">
                {performer?.genreFive && (
                  <div className="genre-val" style={{ display: `${performer.genreFive === 'Unset' || !performer.genreOne ? 'none' : 'block'}` }}>
                    {performer.genreFive}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

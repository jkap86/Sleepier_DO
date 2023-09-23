import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import sleeperLogo from '../../images/sleeper_icon.png';
import axios from 'axios';
import { avatar } from '../../functions/misc';
import { useDispatch, useSelector } from 'react-redux';
import '../../css/css/homepage.css';
import { resetState, setState } from '../../redux/actions/state';
import { fetchMostLeagues } from '../../redux/actions/fetchMostLeagues';

const Homepage = () => {
    const dispatch = useDispatch()
    const { username, leagueId, tab, dropdownVisible, dropdownOptions } = useSelector(state => state.homepage);
    const modalRef = useRef()


    useEffect(() => {
        dispatch(resetState())
    }, [])

    useEffect(() => {
        dispatch(fetchMostLeagues())
    }, [])

    useEffect(() => {
        const handleModal = (event) => {

            if (!modalRef.current || !modalRef.current.contains(event.target)) {

                dispatch(setState({ dropdownVisible: false }, 'HOMEPAGE'));
            }
        };

        document.addEventListener('mousedown', handleModal)
        document.addEventListener('touchstart', handleModal)

        return () => {
            document.removeEventListener('mousedown', handleModal);
            document.removeEventListener('touchstart', handleModal);
        };
    }, [])

    return <div id='homepage'>
        <div className='picktracker'>
            <p className="home click" onClick={() => dispatch(setState({ tab: tab === 'username' ? 'picktracker' : 'username' }, 'HOMEPAGE'))}>
                picktracker
            </p>
            {
                tab === 'picktracker' ?
                    <>
                        <input
                            onChange={(e) => dispatch(setState({ leagueId: e.target.value }, 'HOMEPAGE'))}
                            className='picktracker'
                            placeholder='League ID'
                        />
                        <Link className='home' to={`/picktracker/${leagueId}`}>
                            <button
                                className='click picktracker'
                            >
                                Submit
                            </button>
                        </Link>
                    </>
                    : null
            }

        </div>

        <a target='_blank' className='link' href={`http://18.206.180.1:5000/`}>
            Sleepier Splits BETA
        </a>

        <div className='home_wrapper'>
            <img
                alt='sleeper_logo'
                className='home'
                src={sleeperLogo}
            />
            <div className='home_title'>
                <strong className='home'>
                    Sleepier
                </strong>
                <div className='user_input'>

                    <input
                        className='home'
                        type="text"
                        placeholder="Username"
                        onChange={(e) => dispatch(setState({ username: e.target.value }, 'HOMEPAGE'))}
                    />

                    <i className="fa-solid fa-ranking-star fa-beat" onClick={() => dispatch(setState({ dropdownVisible: true }, 'HOMEPAGE'))}></i>
                </div>
                <Link to={(username === '') ? '/' : `/${username}`}>
                    <button
                        className='home click'
                    >
                        Submit
                    </button>
                </Link>

            </div>
            {
                dropdownVisible && dropdownOptions.length > 0 ?
                    <div className='dropdown_wrapper'>
                        <p className='dropdown_header'>Top League Counts</p>
                        <ol
                            onBlur={() => dispatch(setState({ dropdownVisible: false }, 'HOMEPAGE'))}
                            className="dropdown"
                            ref={modalRef}
                        >
                            {dropdownOptions
                                .sort((a, b) => parseInt(b.leaguesCount) - parseInt(a.leaguesCount))
                                .map((option, index) =>
                                    <li key={`${option.username}_${index}`}>
                                        <button>
                                            {
                                                <>
                                                    <p>
                                                        <span className='leagues_count'>
                                                            {index + 1}
                                                        </span>
                                                        <span className='username'>
                                                            {
                                                                avatar(
                                                                    option.avatar, 'user avatar', 'user'
                                                                )
                                                            }
                                                            {option.username}
                                                        </span>
                                                        <span className='leagues_count'>
                                                            {option.leaguesCount}
                                                        </span>
                                                    </p>

                                                </>
                                            }
                                        </button>
                                    </li>
                                )}
                        </ol>
                    </div >
                    :
                    null
            }


        </div>
    </div>
}

export default Homepage;
import logo from '../logo.svg';

import Navbar from 'react-bootstrap/Navbar';

const Navigation = () => {
    return(
        <Navbar>
            <img 
            alt='logo' 
            src={logo} 
            width='40' 
            height='40' 
            className='d-inline-block align-top mx-3'
            />
            <Navbar.Brand href="#home">Snarfcoin Crowdsale</Navbar.Brand>
        </Navbar>
    )
}

export default Navigation;




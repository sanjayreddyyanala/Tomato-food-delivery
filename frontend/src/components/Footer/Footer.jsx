import React, { useContext } from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const Footer = () => {
  const {whatsappnum} = useContext(StoreContext);
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="" />
            <p>Bringing your favorite meals to your doorstep, our food delivery app connects you with top-rated local restaurants and trusted delivery partners. Whether you're craving something spicy, sweet, or healthy, we've got you covered — fast, fresh, and just a few taps away. Order with confidence and let us take care of the rest!</p>
            <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.twitter_icon} alt="" />
                <img src={assets.linkedin_icon} alt="" />
                <a href={`https://wa.me/${whatsappnum}`} target="blank"><img src={assets.whatsapp_icon} alt="" /></a>
            </div>
        </div>
        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
                <li>+91-9912341234</li>
                <li>contact@tomato.com</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2024 © Tomato.com - All Right Reserved.</p>
    </div>
  )
}

export default Footer

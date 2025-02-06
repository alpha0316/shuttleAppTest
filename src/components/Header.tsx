import React from 'react';

const ShuttleAppHeader = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '12px 24px', // Added padding for better spacing
      boxSizing: 'border-box' // Ensures padding doesn't increase total width
    }}>   
      {/* Logo */}
      <p style={{
        fontSize: 20,
        margin: 0, // Remove default margin
        fontWeight: 'normal'
      }}>
        Shuttle<span style={{
          fontWeight: 700,
          color: '#FFCE31'
        }}>App</span>
      </p>
  
      {/* Navigation */}
      <div style={{
        display: 'flex', 
        gap: 12,
        padding: '8px 10px',
        backgroundColor: 'rgba(217, 217, 217, 0.20)',
        borderRadius: 24,
        alignItems: 'center'
      }}>
        {['Home', 'Bus stops', 'Saved Direction', 'Contact'].map((item, index) => (
          <div key={item} style={{
            fontSize: 16,
            display: 'flex',
            padding: '6px 12px',
            backgroundColor: index === 0 ? '#34A853' : '#fff',
            borderRadius: 36,
            color: index === 0 ? '#fff' : 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            cursor: 'pointer', // Add cursor pointer for interactivity
            transition: 'background-color 0.3s ease' // Smooth transition for hover effects
          }}>
            {item}
          </div>
        ))}
      </div>

      {/* User and Notification Section */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: "center"
      }}>
        {/* Notification Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 6.44V9.77" stroke="black" strokeOpacity="0.6" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/>
          <path d="M12.02 2C8.34002 2 5.36002 4.98 5.36002 8.66V10.76C5.36002 11.44 5.08002 12.46 4.73002 13.04L3.46002 15.16C2.68002 16.47 3.22002 17.93 4.66002 18.41C9.44002 20 14.61 20 19.39 18.41C20.74 17.96 21.32 16.38 20.59 15.16L19.32 13.04C18.97 12.46 18.69 11.43 18.69 10.76V8.66C18.68 5 15.68 2 12.02 2Z" stroke="black" strokeOpacity="0.6" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/>
          <path d="M15.33 18.82C15.33 20.65 13.83 22.15 12 22.15C11.09 22.15 10.25 21.77 9.64998 21.17C9.04998 20.57 8.66998 19.73 8.66998 18.82" stroke="black" strokeOpacity="0.6" strokeWidth="1.5" strokeMiterlimit="10"/>
        </svg>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          gap: 12,
          padding: '8px 12px',
          borderRadius: 12,
          backgroundColor: "#FAFAFA",
          alignItems: 'center'
        }}>
          {/* User Initials */}
          <div style={{
            backgroundColor: 'black',
            borderRadius: '50%', // Make it a perfect circle
            color: 'white',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            AQ
          </div>

          {/* User Details */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <p style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 'bold'
            }}>
              Ato Kwamena Quansah
            </p>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: 'rgba(0,0,0,0.6)'
            }}>
              3390288
            </p>
          </div>

          {/* Dropdown Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2.72003 5.96667L7.0667 10.3133C7.58003 10.8267 8.42003 10.8267 8.93336 10.3133L13.28 5.96667" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ShuttleAppHeader;
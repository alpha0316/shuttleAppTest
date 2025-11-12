import React from 'react';

type DropPoint = {
    name: string;
};

interface BusStopsProps {
    isMobile?: boolean;
}

const staticDropPoints: DropPoint[] = [
    { name: 'Main Gate' },
    { name: 'Library' },
    { name: 'Science Block' },
    { name: 'Hostel A' },
    { name: 'Sports Complex' },
];

const BusStops: React.FC<BusStopsProps> = ({ isMobile = true }) => {
    const currentStopIndex = 2; // highlight this stop as the "current stop"

    return (
        <section
            style={{
                display: 'flex',
                borderRadius: 16,
                // border: '1px solid rgba(0,0,0,0.1)',
                padding: 12,
                flexDirection: 'column',
                gap: 16,
            }}
        >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Bus Stops</p>


            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    overflowX: 'auto',
                    // paddingBottom: 8,
                }}
            >

                <div

                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        // minWidth: 60,
                        gap: 4,
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: '#52B922',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="11" viewBox="0 0 14 11" fill="none">
                            <path d="M13.3337 2V8C13.3337 8.47333 13.0803 8.90667 12.667 9.14667V10.1667C12.667 10.44 12.4403 10.6667 12.167 10.6667H11.8337C11.5603 10.6667 11.3337 10.44 11.3337 10.1667V9.33333H6.66699V10.1667C6.66699 10.44 6.44033 10.6667 6.16699 10.6667H5.83366C5.56033 10.6667 5.33366 10.44 5.33366 10.1667V9.14667C4.92699 8.90667 4.66699 8.47333 4.66699 8V2C4.66699 0 6.66699 0 9.00033 0C11.3337 0 13.3337 0 13.3337 2ZM7.33366 7.33333C7.33366 6.96667 7.03366 6.66667 6.66699 6.66667C6.30033 6.66667 6.00033 6.96667 6.00033 7.33333C6.00033 7.7 6.30033 8 6.66699 8C7.03366 8 7.33366 7.7 7.33366 7.33333ZM12.0003 7.33333C12.0003 6.96667 11.7003 6.66667 11.3337 6.66667C10.967 6.66667 10.667 6.96667 10.667 7.33333C10.667 7.7 10.967 8 11.3337 8C11.7003 8 12.0003 7.7 12.0003 7.33333ZM12.0003 2H6.00033V4.66667H12.0003V2ZM3.33366 3.66667C3.31366 2.74667 2.55366 2 1.63366 2.03333C1.19166 2.04226 0.771302 2.22636 0.465012 2.54515C0.158721 2.86395 -0.0084245 3.29133 0.000327142 3.73333C0.00903384 4.11146 0.145589 4.47549 0.387727 4.76606C0.629864 5.05662 0.963299 5.25658 1.33366 5.33333V10.6667H2.00033V5.33333C2.78699 5.17333 3.33366 4.47333 3.33366 3.66667Z" fill="white" />
                        </svg>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            color: 'rgba(0,0,0,0.6)',
                        }}
                    >
                        Commercial Area
                    </p>
                </div>

                <div className='w-7 h-0.5 bg-green-600' />

                <div

                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 60,
                        gap: 4,
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: '#fdfdfd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M14.6667 4.66663V10.6666C14.6667 11.14 14.4133 11.5733 14 11.8133V12.8333C14 13.1066 13.7733 13.3333 13.5 13.3333H13.1667C12.8933 13.3333 12.6667 13.1066 12.6667 12.8333V12H8V12.8333C8 13.1066 7.77334 13.3333 7.5 13.3333H7.16667C6.89334 13.3333 6.66667 13.1066 6.66667 12.8333V11.8133C6.26 11.5733 6 11.14 6 10.6666V4.66663C6 2.66663 8 2.66663 10.3333 2.66663C12.6667 2.66663 14.6667 2.66663 14.6667 4.66663ZM8.66667 9.99996C8.66667 9.63329 8.36667 9.33329 8 9.33329C7.63334 9.33329 7.33334 9.63329 7.33334 9.99996C7.33334 10.3666 7.63334 10.6666 8 10.6666C8.36667 10.6666 8.66667 10.3666 8.66667 9.99996ZM13.3333 9.99996C13.3333 9.63329 13.0333 9.33329 12.6667 9.33329C12.3 9.33329 12 9.63329 12 9.99996C12 10.3666 12.3 10.6666 12.6667 10.6666C13.0333 10.6666 13.3333 10.3666 13.3333 9.99996ZM13.3333 4.66663H7.33334V7.33329H13.3333V4.66663ZM4.66667 6.33329C4.64667 5.41329 3.88667 4.66663 2.96667 4.69996C2.52467 4.70889 2.10431 4.89299 1.79802 5.21178C1.49173 5.53057 1.32458 5.95796 1.33333 6.39996C1.34204 6.77809 1.4786 7.14212 1.72073 7.43268C1.96287 7.72325 2.29631 7.92321 2.66667 7.99996V13.3333H3.33333V7.99996C4.12 7.83996 4.66667 7.13996 4.66667 6.33329Z" fill="black" fill-opacity="0.5" />
                        </svg>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            color: 'rgba(0,0,0,0.6)',
                        }}
                    >
                        Hall 7
                    </p>
                </div>
                <div className='w-7 h-0.5 bg-neutral-300' />

                <div

                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 60,
                        gap: 4,
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: '#fdfdfd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M14.6667 4.66663V10.6666C14.6667 11.14 14.4133 11.5733 14 11.8133V12.8333C14 13.1066 13.7733 13.3333 13.5 13.3333H13.1667C12.8933 13.3333 12.6667 13.1066 12.6667 12.8333V12H8V12.8333C8 13.1066 7.77334 13.3333 7.5 13.3333H7.16667C6.89334 13.3333 6.66667 13.1066 6.66667 12.8333V11.8133C6.26 11.5733 6 11.14 6 10.6666V4.66663C6 2.66663 8 2.66663 10.3333 2.66663C12.6667 2.66663 14.6667 2.66663 14.6667 4.66663ZM8.66667 9.99996C8.66667 9.63329 8.36667 9.33329 8 9.33329C7.63334 9.33329 7.33334 9.63329 7.33334 9.99996C7.33334 10.3666 7.63334 10.6666 8 10.6666C8.36667 10.6666 8.66667 10.3666 8.66667 9.99996ZM13.3333 9.99996C13.3333 9.63329 13.0333 9.33329 12.6667 9.33329C12.3 9.33329 12 9.63329 12 9.99996C12 10.3666 12.3 10.6666 12.6667 10.6666C13.0333 10.6666 13.3333 10.3666 13.3333 9.99996ZM13.3333 4.66663H7.33334V7.33329H13.3333V4.66663ZM4.66667 6.33329C4.64667 5.41329 3.88667 4.66663 2.96667 4.69996C2.52467 4.70889 2.10431 4.89299 1.79802 5.21178C1.49173 5.53057 1.32458 5.95796 1.33333 6.39996C1.34204 6.77809 1.4786 7.14212 1.72073 7.43268C1.96287 7.72325 2.29631 7.92321 2.66667 7.99996V13.3333H3.33333V7.99996C4.12 7.83996 4.66667 7.13996 4.66667 6.33329Z" fill="black" fill-opacity="0.5" />
                        </svg>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            color: 'rgba(0,0,0,0.6)',
                        }}
                    >
                        Pentecost Busstop
                    </p>
                </div>

            </div>

        </section>
    );
};

export default BusStops;

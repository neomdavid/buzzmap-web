import { Camera, PencilLine, PencilSimple } from 'phosphor-react';
import profile1 from '../../assets/profile1.png';
import profile_bg from '../../assets/profile_bg.png';
import { PostCard } from '@/components';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toastInfo } from '../../utils.jsx';
import { CustomInput, NewPostModal } from '../../components';

function Profile(){
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('validated');
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);

    const fetchProfileData = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/v1/accounts/profile/${user._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setProfileData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id && token) {
            fetchProfileData();
        }
    }, [user, token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const renderReports = () => {
        const reports = profileData?.recentActivity?.reports?.[activeTab.charAt(0).toUpperCase() + activeTab.slice(1)] || [];
        
        return (
            <div className='flex flex-col rounded-md gap-2 p-10 py-8 bg-base-200'>
                {reports.map((report) => (
                    <div key={report._id} className={`relative ${activeTab === 'rejected' ? "opacity-75" : ""}`}>
                        {activeTab === 'pending' && (
                            <div className='absolute top-6 right-6 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium z-10'>
                                Pending Review
                            </div>
                        )}
                        <PostCard 
                            postId={report._id}
                            profileImage={profileData?.account?.profilePhotoUrl || profile1}
                            username={profileData?.account?.username}
                            timestamp={new Date(report.date_and_time).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            barangay={report.barangay}
                            coordinates={report.specific_location?.coordinates || []}
                            dateTime={new Date(report.date_and_time).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            reportType={report.report_type}
                            description={report.description}
                            images={report.images || []}
                            upvotes={report.upvotes?.length || 0}
                            downvotes={report.downvotes?.length || 0}
                            commentsCount={report._comments?.length || 0}
                            upvotesArray={report.upvotes || []}
                            downvotesArray={report.downvotes || []}
                            userId={report.user?._id}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return <main className="text-primary flex justify-center gap-20 relative p-10 pt-20 sm:pt-20">
        <div className='absolute top-0 left-0 w-full h-100 bg-cover bg-center bg-no-repeat' style={{ backgroundImage: `url(${profile_bg})` }}></div>
        <section className="flex flex-col max-w-xl shadow-lg gap-2 p-6 py-14 items-center rounded-t-2xl bg-white rounded-t-[35px] relative z-10 sticky top-24 h-fit max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-primary sm:scrollbar-track-transparent pr-2">
            <div className='relative mb-4 '>
                <img 
                    src={profileData?.account?.profilePhotoUrl || profile1} 
                    alt="profile" 
                    className='rounded-full w-59 h-59 bg-primary border-5 border-primary shadow-sm object-cover' 
                />
                <div className='absolute text-white bottom-[5%] right-[5%] bg-primary p-2.5 rounded-full hover:cursor-pointer hover:bg-primary/80 transition-all duration-300 '>
                    <Camera size={24} />
                </div>
            </div>
            <p className='text-5xl font-bold'>{profileData?.account?.username}</p>
            <p className='text-xl text-primary mb-8'>{profileData?.account?.email}</p>
            <div className='flex justify-around gap-2 mb-6 w-full'>
                <div className='flex flex-col gap-2 items-center justify-center'>
                    <p className='text-5xl font-bold'>{profileData?.statistics?.reportsByStatus?.Validated || 0}</p>
                    <p className='text-lg text-primary'>Reports Posted</p>
                </div>
                <div className='flex flex-col gap-2 items-center justify-center'>
                    <p className='text-5xl font-bold'>{profileData?.statistics?.totalUpvotes}</p>
                    <p className='text-lg text-primary'>Upvotes</p>
                </div>
            </div>
            <hr className='w-[80%] border-[1px] border-gray-300 mb-6'/>
            <div className='w-[80%] text-lg flex flex-col gap-6 mb-6'>
                <p className='font-bold text-2xl'>About {profileData?.account?.username}</p>
                <p>Active community member and dengue awareness advocate. Contributing to a healthier community through regular reporting and engagement.</p>
                <div>
                    <p><span className='font-bold'>Status: </span>{profileData?.account?.status}</p>
                    <p><span className='font-bold'>Joined: </span>{new Date(profileData?.account?.lastUpdated).toLocaleDateString()}</p>
                </div>
            </div>
            <hr className='w-[80%] border-[1px] border-gray-300 mb-6'/>
            <div className='w-[80%] text-lg flex flex-col gap-6 mb-6'>
                <p className='font-bold text-2xl'>Media</p>
                <div className="grid grid-cols-3 gap-4 w-full">
                    {profileData?.photos
                        ?.filter(photo => photo.status === "Validated")
                        .map((photo, index) => (
                            <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <img 
                                    src={photo.url} 
                                    alt={`Validated photo ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                    ))}
                </div>
            </div>
        </section>
        <section className='hidden max-w-5xl z-5 lg:block lg:flex-1 pt-55'>
            <div className='bg-white p-6 rounded-xl flex flex-col shadow-md mb-6'>
                <p className='font-bold text-xl mb-4'>Share your experience to the Community</p>
                <hr className='text-accent mb-4'/>
                <button
                    onClick={() => {
                        user?._id && token
                            ? document.getElementById("my_modal_4").showModal()
                            : toastInfo("Log in to report a breeding site.");
                    }}
                    className="w-full hover:cursor-pointer"
                >
                    <CustomInput 
                        profileSrc={profileData?.account?.profilePhotoUrl || profile1} 
                        showImagePicker={true} 
                        className="hover:cursor-pointer" 
                        readOnly
                    />
                </button>
            </div>
            <NewPostModal 
                onSubmit={() => {
                    // Refresh profile data after successful post
                    if (user?._id && token) {
                        fetchProfileData();
                    }
                }}
                profilePhoto={profileData?.account?.profilePhotoUrl || profile1}
            />
            <div className='flex flex-col gap-8'>
                <div>
                    <div className='flex items-center justify-between mb-4'>
                        <p className='font-bold text-3xl'>My Reports</p>
                        <div className='flex gap-2'>
                            <button 
                                onClick={() => setActiveTab('validated')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    activeTab === 'validated' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Validated ({profileData?.statistics?.reportsByStatus?.Validated || 0})
                            </button>
                            <button 
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    activeTab === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Pending ({profileData?.statistics?.reportsByStatus?.Pending || 0})
                            </button>
                            <button 
                                onClick={() => setActiveTab('rejected')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    activeTab === 'rejected' 
                                    ? 'bg-gray-200 text-gray-900 border-2 border-gray-300' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Rejected ({profileData?.statistics?.reportsByStatus?.Rejected || 0})
                            </button>
                        </div>
                    </div>
                    {renderReports()}
                </div>
            </div>
        </section>
    </main>;
}

export default Profile;
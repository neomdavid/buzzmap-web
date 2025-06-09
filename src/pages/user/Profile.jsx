import { Camera, PencilLine, PencilSimple } from 'phosphor-react';
import profile1 from '../../assets/profile1.png';
import profile_bg from '../../assets/profile_bg.png';
import { PostCard } from '@/components';
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toastInfo, toastSuccess, toastError } from '../../utils.jsx';
import { CustomInput, NewPostModal } from '../../components';
import { useUpdateProfilePhotoMutation, useUpdateBioMutation } from '../../api/dengueApi';
import { updateUser } from '../../features/authSlice';

function Profile(){
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('validated');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [bioText, setBioText] = useState('');
    const [updatingBio, setUpdatingBio] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const confirmModalRef = useRef(null);
    const editProfileModalRef = useRef(null);
    const bioModalRef = useRef(null);
    const [updateProfilePhoto] = useUpdateProfilePhotoMutation();
    const [updateBio] = useUpdateBioMutation();

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

    // Initialize bio text when profile data loads
    useEffect(() => {
        if (profileData?.account?.bio !== undefined) {
            setBioText(profileData.account.bio);
        }
    }, [profileData]);

    const handleCameraClick = () => {
        editProfileModalRef.current?.showModal();
    };

    const handleChangePhotoClick = () => {
        editProfileModalRef.current?.close();
        fileInputRef.current?.click();
    };

    const handleEditBioClick = () => {
        setBioText(profileData?.account?.bio || '');
        bioModalRef.current?.showModal();
    };

    const handleSaveBio = async () => {
        setUpdatingBio(true);
        try {
            const result = await updateBio({ 
                id: user._id, 
                bio: bioText 
            }).unwrap();
            
            toastSuccess('Bio updated successfully!');
            
            // Update local profile data directly instead of refetching everything
            setProfileData(prevData => ({
                ...prevData,
                account: {
                    ...prevData.account,
                    bio: bioText
                }
            }));
            
            // Update Redux store with new bio
            dispatch(updateUser({ bio: bioText }));
            
            // Close modal
            bioModalRef.current?.close();
        } catch (error) {
            console.error('Error updating bio:', error);
            toastError(error?.data?.message || 'Failed to update bio');
        } finally {
            setUpdatingBio(false);
        }
    };

    const handleCancelBioEdit = () => {
        setBioText(profileData?.account?.bio || '');
        bioModalRef.current?.close();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toastError('Please select a valid image file (JPEG, PNG, or GIF)');
            return;
        }

        // Validate file size (e.g., 5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            toastError('Image size must be less than 5MB');
            return;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(url);
        
        // Show confirmation modal
        confirmModalRef.current?.showModal();
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        setUploadingPhoto(true);

        try {
            const formData = new FormData();
            formData.append('email', user.email);
            formData.append('profilePhoto', selectedFile);

            const result = await updateProfilePhoto(formData).unwrap();
            
            toastSuccess('Profile photo updated successfully!');
            
            // Refresh profile data to get the new photo URL
            await fetchProfileData();
            
            // Close dialog and cleanup
            handleCancelUpload();
            
            // Update Redux store with new profile photo URL
            // The API response should contain the new profile photo URL
            if (result?.profilePhotoUrl) {
                dispatch(updateUser({ profilePhotoUrl: result.profilePhotoUrl }));
            } else if (result?.user?.profilePhotoUrl) {
                dispatch(updateUser({ profilePhotoUrl: result.user.profilePhotoUrl }));
            }
            
        } catch (error) {
            console.error('Error updating profile photo:', error);
            toastError(error?.data?.message || 'Failed to update profile photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Close modal
        confirmModalRef.current?.close();
    };

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
        <section className="flex flex-col w-[90vw] lg:w-[30vw] max-w-xl shadow-lg gap-2 p-6 py-14 items-center rounded-t-2xl bg-white rounded-t-[35px] relative z-10 sticky top-24 h-fit max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-primary sm:scrollbar-track-transparent pr-2">
            <div className='relative mb-4 '>
                <img 
                    src={profileData?.account?.profilePhotoUrl || profile1} 
                    alt="profile" 
                    className='rounded-full w-59 h-59 bg-primary border-5 border-primary shadow-sm object-cover' 
                />
                <div 
                    onClick={handleCameraClick}
                    className={`absolute text-white bottom-[5%] right-[5%] bg-primary p-2.5 rounded-full hover:cursor-pointer hover:bg-primary/80 transition-all duration-300 ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={uploadingPhoto}
                >
                    {uploadingPhoto ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <Camera size={24} />
                    )}
                </div>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    className="hidden"
                />
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
                
                {/* Bio Section */}
                <div className="relative group w-full">
                    <div className="min-h-[60px] flex items-start w-full p-3 rounded-lg border border-transparent group-hover:border-primary/30 group-hover:bg-gray-50 transition-all duration-200 cursor-pointer" onClick={handleEditBioClick}>
                        <p className="text-gray-700 leading-relaxed flex-1 break-words overflow-wrap-anywhere w-full max-w-full overflow-hidden">
                            {profileData?.account?.bio ? (
                                profileData.account.bio
                            ) : (
                                <span className="text-gray-400 italic">
                                    No bio added yet. Click here to add your bio.
                                </span>
                            )}
                        </p>
                        <div className="flex flex-col items-center gap-1 ml-2 flex-shrink-0">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditBioClick();
                                }}
                                className="p-1.5 rounded-full hover:bg-primary/10 text-primary/70 hover:text-primary transition-all duration-200 cursor-pointer"
                                title="Edit bio"
                            >
                                <PencilSimple size={18} />
                            </button>
                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Edit
                            </span>
                        </div>
                    </div>
                </div>
                
                <div>
                    {/* <p><span className='font-bold'>Status: </span>{profileData?.account?.status}</p> */}
                    <p><span className='font-bold'>Joined: </span>{new Date(profileData?.account?.lastUpdated).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                </div>
            </div>
            <hr className='w-[80%] border-[1px] border-gray-300 mb-6'/>
            <div className='w-[80%] text-lg flex flex-col gap-6 mb-6'>
                <p className='font-bold text-2xl'>Media</p>
                <div className="grid grid-cols-3 gap-4 w-full">
                    {profileData?.photos
                        ?.filter(photo => photo.status === "Validated")
                        .length > 0 ? (
                        profileData.photos
                            .filter(photo => photo.status === "Validated")
                            .map((photo, index) => (
                                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <img 
                                        src={photo.url} 
                                        alt={`Validated photo ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ))
                    ) : (
                        <div className="col-span-3 text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📷</div>
                            <p className="text-gray-500 text-lg font-medium">No photos posted yet</p>
                            <p className="text-gray-400 text-sm mt-2">Share your community reports to see photos here</p>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* Edit Profile Modal - First Modal */}
        <dialog ref={editProfileModalRef} className="modal">
            <div className="modal-box w-11/12 max-w-md p-10">
                <p className="font-extrabold text-3xl text-center mb-6">Edit Profile</p>
                
                {/* Profile Photo with Edit Overlay */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <img 
                            src={profileData?.account?.profilePhotoUrl || profile1} 
                            alt="profile" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                        />
                        <div 
                            onClick={handleChangePhotoClick}
                            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        >
                            <Camera size={32} className="text-white" />
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-gray-600 mb-6">
                    Click on your photo to change it
                </p>
                
                <div className="modal-action justify-center">
                    <button
                        onClick={() => editProfileModalRef.current?.close()}
                        className="btn btn-outline"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </dialog>

        {/* Profile Photo Confirmation Modal - DaisyUI Style */}
        <dialog ref={confirmModalRef} className="modal">
            <div className="modal-box w-11/12 max-w-md p-10">
                <p className="font-extrabold text-3xl text-center mb-4">Update Profile Photo</p>
                
                {/* Preview Image */}
                {previewUrl && (
                    <div className="flex justify-center mb-6">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-40 h-40 rounded-full object-cover border-4 border-primary"
                        />
                    </div>
                )}
                
                <p className="text-center text-gray-600 mb-6">
                    Are you sure you want to update your profile photo with this image?
                </p>
                
                {/* Action Buttons */}
                <div className="modal-action justify-center">
                    <button
                        onClick={handleCancelUpload}
                        className="btn btn-outline"
                        disabled={uploadingPhoto}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmUpload}
                        className={`btn btn-primary ${uploadingPhoto ? 'loading' : ''}`}
                        disabled={uploadingPhoto}
                    >
                        {uploadingPhoto ? 'Uploading...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </dialog>

        {/* Bio Edit Modal */}
        <dialog ref={bioModalRef} className="modal">
            <div className="modal-box w-11/12 max-w-md p-10">
                <p className="font-extrabold text-3xl text-center mb-6">Edit Bio</p>
                
                <div className="flex flex-col gap-4">
                    <textarea
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Tell the community about yourself..."
                        maxLength={500}
                        className="w-full p-4 border-2 border-primary/60 rounded-lg resize-none focus:border-primary outline-none text-base"
                        rows={6}
                    />
                    
                    <div className="flex justify-end">
                        <span className="text-sm text-gray-500">
                            {bioText.length}/500 characters
                        </span>
                    </div>
                </div>
                
                <div className="modal-action justify-center">
                    <button
                        onClick={handleCancelBioEdit}
                        className="btn btn-outline"
                        disabled={updatingBio}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveBio}
                        className={`btn btn-primary ${updatingBio ? 'loading' : ''}`}
                        disabled={updatingBio}
                    >
                        {updatingBio ? 'Saving...' : 'Save Bio'}
                    </button>
                </div>
            </div>
        </dialog>

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
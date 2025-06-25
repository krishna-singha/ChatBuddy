import { useState, useRef, useContext } from 'react';
import DEFAULT_AVATAR from '../assets/defaultAvatar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();

    const { authUser, updateProfile, logout } = useContext(AuthContext);

    const [name, setName] = useState(authUser?.name);
    const [bio, setBio] = useState(authUser?.bio);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (!avatar) {
                // No new avatar selected
                await updateProfile({ name, bio });
                toast.success("Profile updated!");
                navigate("/");
            } else {
                const reader = new FileReader();
                reader.readAsDataURL(avatar);

                reader.onload = async () => {
                    try {
                        const avatarUrl = reader.result as string;

                        // Send avatar + current avatar public ID to allow backend to delete old image
                        await updateProfile({
                            name,
                            bio,
                            avatar: avatarUrl,
                            avatarPublicId: authUser?.avatarPublicId || null,
                        });

                        toast.success("Profile updated!");
                        navigate("/");
                    } catch (err) {
                        console.error(err);
                        toast.error("Failed to update avatar.");
                    } finally {
                        setSaving(false);
                    }
                };

                return;
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            if (!avatar) setSaving(false);
        }
    };



    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
            <div className="w-full max-w-md p-6 bg-gray-800/50 border border-gray-700/30 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

                <div className="mb-4 text-center overflow-hidden cursor-pointer flex justify-center items-center" onClick={() => fileInputRef.current?.click()}>
                    <input
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setAvatar(e.target.files[0]);
                            }
                        }}
                        ref={fileInputRef}
                        type="file"
                        id='avatar'
                        accept='.png, .jpg, .jpeg'
                        hidden
                    />
                    <img
                        src={
                            avatar
                                ? URL.createObjectURL(avatar)
                                : authUser?.avatar
                                    ? authUser.avatar
                                    : DEFAULT_AVATAR
                        }
                        alt="Avatar"
                        className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-cyan-500 shadow-md"
                    />

                </div>

                <div className="mb-4">
                    {/* <label className="block text-sm text-gray-300 mb-1">Display Name</label> */}
                    <input
                        type="text"
                        placeholder='Enter Name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    />
                </div>

                <div className="mb-6">
                    {/* <label className="block text-sm text-gray-300 mb-1">Enter Bio</label> */}
                    <textarea
                        rows={3}
                        placeholder="Enter Bio"
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        maxLength={500}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="resize-none w-full px-4 py-2 bg-gray-900 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    />
                </div>


                <div className='flex flex-col item-center gap-6'>
                    <button
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 transition-all text-white font-semibold text-lg shadow-lg shadow-cyan-500/30 cursor-pointer"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-500 hover:scale-105 transition-all text-white font-semibold text-lg cursor-pointer"
                        onClick={logout}
                        disabled={saving}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
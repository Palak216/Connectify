import { useState } from 'react';
import { ImagePlus, X, Send } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../config';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          // Do NOT set Content-Type, browser will set it with boundary for FormData
          ...getAuthHeaders(),
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create post');

      // Reset form
      setContent('');
      removeImage();
      
      // Notify parent to refresh feed
      if (onPostCreated) onPostCreated();

    } catch (err) {
      console.error(err);
      alert('Error creating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          
          <div className="avatar">
            {localStorage.getItem('username')?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <div style={{ flex: 1 }}>
            <textarea
              className="form-input"
              placeholder="What's on your mind?"
              style={{ minHeight: '80px', resize: 'vertical', border: 'none', background: 'rgba(0,0,0,0.1)' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {preview && (
              <div style={{ position: 'relative', marginTop: '10px', display: 'inline-block' }}>
                <img 
                  src={preview} 
                  alt="Preview" 
                  style={{ maxHeight: '200px', borderRadius: 'var(--radius-md)' }} 
                />
                <button 
                  type="button"
                  onClick={removeImage}
                  style={{ 
                    position: 'absolute', top: '5px', right: '5px', 
                    background: 'rgba(0,0,0,0.6)', color: 'white', 
                    border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' 
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-primary)' }}>
                <ImagePlus size={20} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Add Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange}
                />
              </label>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || (!content.trim() && !image)}
                style={{ padding: '8px 24px' }}
              >
                {loading ? 'Posting...' : <><Send size={16} /> Post</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;

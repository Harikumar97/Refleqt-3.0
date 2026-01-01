'use client';

import { useState } from 'react';
import './brewery.css';

interface BreweryItem {
  id: string;
  title: string;
}

interface WriterRequestModalProps {
  selectedItems: BreweryItem[];
  onClose: () => void;
  onSubmit: (request: WriterRequest) => void;
}

interface WriterRequest {
  breweryItemIds: string[];
  platform: string;
  contentType: string;
  deadline?: string;
  brief?: string;
}

export function WriterRequestModal({
  selectedItems,
  onClose,
  onSubmit,
}: WriterRequestModalProps) {
  const [platform, setPlatform] = useState('linkedin');
  const [contentType, setContentType] = useState('article');
  const [deadline, setDeadline] = useState('');
  const [brief, setBrief] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        breweryItemIds: selectedItems.map((item) => item.id),
        platform,
        contentType,
        deadline: deadline || undefined,
        brief: brief || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Writer Request</h2>
          <p className="modal-subtitle">
            Send selected insights to the Expert Writers platform
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="platform">
              Target Platform
            </label>
            <select
              id="platform"
              className="form-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter/X</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="blog">Blog</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contentType">
              Content Type
            </label>
            <select
              id="contentType"
              className="form-select"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              required
            >
              <option value="article">Article / Long-form</option>
              <option value="thread">Thread / Series</option>
              <option value="post">Single Post</option>
              <option value="carousel">Carousel</option>
              <option value="video-script">Video Script</option>
              <option value="infographic">Infographic Copy</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deadline">
              Deadline (Optional)
            </label>
            <input
              id="deadline"
              type="datetime-local"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="brief">
              Additional Brief (Optional)
            </label>
            <textarea
              id="brief"
              className="form-textarea"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Any specific requirements, tone, style, or audience considerations..."
            />
          </div>

          <div className="form-group">
            <div className="selected-items">
              <div className="selected-items-title">
                Selected Insights ({selectedItems.length})
              </div>
              <div className="selected-items-list">
                {selectedItems.map((item) => (
                  <div key={item.id} className="selected-item">
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || selectedItems.length === 0}
            >
              {isSubmitting ? 'Creating Request...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

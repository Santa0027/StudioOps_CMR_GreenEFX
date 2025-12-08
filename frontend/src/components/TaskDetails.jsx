import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Dummy data for task details based on taskId
const getTaskDetails = (taskId) => {
  switch (taskId) {
    case '1':
      return {
        id: '1',
        title: 'Character Rigging - Final Pass',
        project: 'Project Nebula',
        mainCharacter: 'Main Character',
        workType: '3d_animation',
        imageUrl: 'https://cdn.pixabay.com/photo/2023/11/27/12/35/ai-generated-8395568_1280.jpg',
        timeTracked: '01:23:45',
        notes: [
          { id: 1, user: 'Jane Doe', comment: 'Can we adjust the elbow joint rotation limits?', type: 'feedback', timestamp: '2025-11-30 14:00' },
          { id: 2, user: 'John Smith', comment: 'Mesh deformation looks clean on arm movements.', type: 'feedback', timestamp: '2025-11-30 14:15' },
          { id: 3, user: 'Project Manager', comment: 'Overall progress is looking solid. Let\'s aim to wrap this up by EOD.', type: 'comment', avatar: 'https://i.pravatar.cc/150?img=12', timestamp: '2025-11-30 15:00' },
        ],
        reviewData: {
          keyAreas: ['Joint Limits', 'Skinning', 'Controls'],
          rigComplexity: 'High',
        },
      };
    case '2':
      return {
        id: '2',
        title: 'Animate Walk Cycle - Main Character (Rework)',
        project: 'Project Cygnus',
        mainCharacter: 'Main Character',
        workType: 'video_editing',
        imageUrl: 'https://cdn.pixabay.com/photo/2016/11/29/05/45/film-1867140_1280.jpg',
        timeTracked: '02:00:10',
        notes: [
          { id: 1, user: 'Client', comment: 'The pacing in the first 10 seconds feels a bit off, can we speed it up slightly?', type: 'feedback', timestamp: '2025-11-29 10:30' },
          { id: 2, user: 'Editor', comment: 'Applying a new color grade for consistency. Reviewing cuts for smoothness.', type: 'comment', avatar: 'https://i.pravatar.cc/150?img=13', timestamp: '2025-11-29 11:00' },
        ],
        reviewData: {
          timelineSegments: ['Intro', 'Main Loop', 'Outro'],
          fps: 24,
        },
      };
    case '3':
      return {
        id: '3',
        title: 'Concept Art for Alien Flora (Assigned)',
        project: 'Project Orion',
        mainCharacter: 'Environment',
        workType: 'graphic_design',
        imageUrl: 'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg',
        timeTracked: '00:45:00',
        notes: [
          { id: 1, user: 'Art Director', comment: 'Experiment with more bioluminescent elements.', type: 'feedback', timestamp: '2025-11-28 09:00' },
          { id: 2, user: 'Artist', comment: 'Working on variations for the plant structures.', type: 'comment', avatar: 'https://i.pravatar.cc/150?img=14', timestamp: '2025-11-28 10:00' },
        ],
        reviewData: {
          colorPalette: ['Green-Blue', 'Purple-Pink'],
          styleGuide: 'Sci-Fi Organic',
        },
      };
    default:
      return {
        id: taskId,
        title: 'Generic Task Details',
        project: 'Unknown Project',
        mainCharacter: 'N/A',
        workType: 'normal',
        imageUrl: 'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg',
        timeTracked: '00:00:00',
        notes: [],
        reviewData: {},
      };
  }
};

const GraphicDesignReview = ({ reviewData }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-2">Graphic Design Review</h3>
    <p>Color Palette: {reviewData.colorPalette?.join(', ')}</p>
    <p>Style Guide: {reviewData.styleGuide}</p>
    {/* Add specific graphic design tools/views here */}
  </div>
);

const Animation3DReview = ({ reviewData }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-2">3D Animation Review</h3>
    <p>Key Rigging Areas: {reviewData.keyAreas?.join(', ')}</p>
    <p>Rig Complexity: {reviewData.rigComplexity}</p>
    {/* Add specific 3D animation tools/views here */}
  </div>
);

const VideoEditingReview = ({ reviewData }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-2">Video Editing Review</h3>
    <p>Timeline Segments: {reviewData.timelineSegments?.join(', ')}</p>
    <p>FPS: {reviewData.fps}</p>
    {/* Add specific video editing tools/views here */}
  </div>
);

function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newCommentType, setNewCommentType] = useState('comment');

  useEffect(() => {
    // Simulate fetching task details
    setTask(getTaskDetails(taskId));
  }, [taskId]);

  if (!task) {
    return <div className="min-h-screen bg-black text-white p-6">Loading task details...</div>;
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedNotes = [
        ...task.notes,
        {
          id: task.notes.length + 1,
          user: 'Current User', // Replace with actual user
          comment: newComment,
          type: newCommentType,
          timestamp: new Date().toLocaleString(),
          avatar: 'https://i.pravatar.cc/150?img=15', // Placeholder for current user
        },
      ];
      setTask({ ...task, notes: updatedNotes });
      setNewComment('');
    }
  };

  const getReviewComponent = (workType, reviewData) => {
    switch (workType) {
      case 'graphic_design':
        return <GraphicDesignReview reviewData={reviewData} />;
      case '3d_animation':
        return <Animation3DReview reviewData={reviewData} />;
      case 'video_editing':
        return <VideoEditingReview reviewData={reviewData} />;
      case 'motion_graphics':
        return <p className="text-gray-400">Motion Graphics Review area coming soon!</p>; // Placeholder
      default:
        return <p className="text-gray-400">No specialized review tools for this task type.</p>;
    }
  };

  const getNoteBorderColor = (type) => {
    switch (type) {
      case 'feedback':
        return 'border-red-500';
      case 'comment':
        return 'border-blue-500';
      default:
        return 'border-gray-500';
    }
  };


  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Breadcrumbs */}
      <div className="text-gray-400 mb-6">
        <span>{task.project}</span>  <span>{task.mainCharacter}</span>  <span>{task.type}</span> ({task.workType?.replace('_', ' ').toUpperCase()})
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">{task.title}</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
          </button>
          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
            <img className="h-full w-full rounded-full" src="https://i.pravatar.cc/150?img=11" alt="User Avatar" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 bg-gray-800 rounded-lg shadow-lg relative p-6"> {/* Added p-6 here */}
          <img src={task.imageUrl} alt={task.title} className="w-full h-auto rounded-lg mb-4" /> {/* Added mb-4 */}
          {/* Specialized Review Area */}
          {getReviewComponent(task.workType, task.reviewData)}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-gray-900 bg-opacity-75 p-3 rounded-full">
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v11l6-3 6 3 6-3V3l-6 3-6-3-6 3z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m0 0h-3" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2zm7-9v5a1 1 0 11-2 0v-5m-4 1a1 1 0 100 2h.01a1 1 0 100-2H11zm-4 4a1 1 0 100 2h.01a1 1 0 100-2H7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* Actions */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Actions</h2>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                IN PROGRESS
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Time Tracked</p>
            <p className="text-3xl font-bold mb-4">{task.timeTracked}</p>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H11a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H14a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Pause Timer
            </button>
            <div className="flex space-x-4">
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Upload Work
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                Mark as Complete
              </button>
            </div>
          </div>

          {/* Notes / Feedback */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Notes / Feedback</h2>
            <div className="space-y-6">
              {task.notes.map((note) => (
                <div key={note.id} className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${getNoteBorderColor(note.type)}`}>
                  {note.type === 'comment' && note.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full flex-shrink-0"
                      src={note.avatar}
                      alt={note.user}
                    />
                  ) : (
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white text-xs font-bold">
                      {note.user.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{note.user} <span className="text-gray-500 text-xs ml-2">{note.timestamp}</span></p>
                    <p className="text-gray-300 text-sm">{note.comment}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-700 pt-6">
              <h3 className="font-semibold mb-2">Add a comment...</h3>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setNewCommentType('comment')}
                  className={`${newCommentType === 'comment' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors`}
                >
                  Comment
                </button>
                <button
                  onClick={() => setNewCommentType('feedback')}
                  className={`${newCommentType === 'feedback' ? 'bg-red-600' : 'bg-gray-700'} hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors`}
                >
                  Feedback
                </button>
              </div>
              <div className="flex">
                <textarea
                  className="flex-grow bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Type your comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                  onClick={handleAddComment}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.854 7.146a.5.5 0 010 .708L7.707 11.001l3.147 3.146a.5.5 0 01-.708.708l-3.5-3.5a.5.5 0 010-.708l3.5-3.5a.5.5 0 01.708 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;

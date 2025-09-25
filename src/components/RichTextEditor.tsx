import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Mic, Play, Pause, X, MoveUp, MoveDown } from 'lucide-react';
import Compressor from 'compressorjs';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  data?: Blob;
  filename?: string;
}

interface RichTextEditorProps {
  initialContent?: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent = [], onChange }) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialContent.length > 0 ? initialContent : [{ id: crypto.randomUUID(), type: 'text', content: '' }]
  );
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    onChange(blocks);
  }, [blocks, onChange]);

  const addBlock = (type: 'text' | 'image' | 'audio', afterIndex: number) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
    };

    setBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      return newBlocks;
    });
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => {
      const filtered = prev.filter(block => block.id !== id);
      return filtered.length === 0 ? [{ id: crypto.randomUUID(), type: 'text', content: '' }] : filtered;
    });
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index === -1) return prev;

      const newBlocks = [...prev];
      if (direction === 'up' && index > 0) {
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      } else if (direction === 'down' && index < newBlocks.length - 1) {
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      }
      return newBlocks;
    });
  };

  const handleImageUpload = (blockIndex: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        new Compressor(file, {
          quality: 0.8,
          success: (compressedFile) => {
            const newBlock: ContentBlock = {
              id: crypto.randomUUID(),
              type: 'image',
              content: '',
              data: compressedFile as Blob,
              filename: file.name,
            };
            setBlocks(prev => {
              const newBlocks = [...prev];
              newBlocks.splice(blockIndex + 1, 0, newBlock);
              return newBlocks;
            });
          },
          error: (err) => {
            console.error('Compression failed:', err);
          },
        });
      }
    };

    input.click();
  };

  const startAudioRecording = async (blockIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
        
        const newBlock: ContentBlock = {
          id: crypto.randomUUID(),
          type: 'audio',
          content: '',
          data: audioBlob,
          filename: audioFile.name,
        };

        setBlocks(prev => {
          const newBlocks = [...prev];
          newBlocks.splice(blockIndex + 1, 0, newBlock);
          return newBlocks;
        });

        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Audio recording failed:', error);
      alert('Audio recording not supported or permission denied');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const playAudio = (blockId: string) => {
    const audio = audioRefs.current[blockId];
    if (audio) {
      if (playingAudio === blockId) {
        audio.pause();
        setPlayingAudio(null);
      } else {
        if (playingAudio) {
          const currentAudio = audioRefs.current[playingAudio];
          if (currentAudio) currentAudio.pause();
        }
        audio.play();
        setPlayingAudio(blockId);
      }
    }
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <div key={block.id} className="group relative">
          {/* Block Controls */}
          <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
            <button
              onClick={() => moveBlock(block.id, 'up')}
              disabled={index === 0}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MoveUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveBlock(block.id, 'down')}
              disabled={index === blocks.length - 1}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MoveDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeBlock(block.id)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Block Content */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
            {block.type === 'text' && (
              <div>
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className="w-full bg-transparent text-white border-none outline-none resize-none min-h-[100px] placeholder-gray-500"
                  placeholder="Type your text here..."
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleImageUpload(index)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Image</span>
                  </button>
                  {isRecording ? (
                    <button
                      onClick={stopAudioRecording}
                      className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs transition-colors animate-pulse"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startAudioRecording(index)}
                      className="flex items-center space-x-1 px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs transition-colors"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Record</span>
                    </button>
                  )}
                  <button
                    onClick={() => addBlock('text', index)}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs transition-colors"
                  >
                    <span>+ Text</span>
                  </button>
                </div>
              </div>
            )}

            {block.type === 'image' && (
              <div>
                {block.data && (
                  <img
                    src={URL.createObjectURL(block.data)}
                    alt={block.filename || 'Image'}
                    className="max-w-full max-h-64 object-contain rounded mb-2"
                  />
                )}
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className="w-full bg-transparent text-gray-300 border-none outline-none resize-none min-h-[60px] placeholder-gray-600 text-sm"
                  placeholder="Add a caption or description for this image..."
                />
              </div>
            )}

            {block.type === 'audio' && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => playAudio(block.id)}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                  >
                    {playingAudio === block.id ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    <span>{playingAudio === block.id ? 'Pause' : 'Play'}</span>
                  </button>
                  <span className="text-sm text-gray-400">{block.filename}</span>
                </div>
                {block.data && (
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[block.id] = el;
                    }}
                    onEnded={() => setPlayingAudio(null)}
                    className="hidden"
                  >
                    <source src={URL.createObjectURL(block.data)} type="audio/wav" />
                  </audio>
                )}
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className="w-full bg-transparent text-gray-300 border-none outline-none resize-none min-h-[60px] placeholder-gray-600 text-sm"
                  placeholder="Add notes about this audio recording..."
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RichTextEditor;
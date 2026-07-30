/**
 * AgriFeed.tsx — Community feed for ACA Platform
 * Features: text/photo/video posts, polls with live voting,
 * content moderation, comments (subcollection), likes, share,
 * industry badges, clickable avatars → profile navigation.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Heart, Share2, Image as ImageIcon, Video,
  BarChart2, Send, User as UserIcon, Clock, Trash2, Edit3,
  BadgeCheck, Star, Phone, Mail, X, Plus, Loader2, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  collection, addDoc, onSnapshot, query, orderBy, limit,
  serverTimestamp, updateDoc, doc, deleteDoc,
  arrayUnion, arrayRemove, increment, getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { Post, UserProfile } from '../types';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface AgriFeedProps {
  user: any;
  profile: UserProfile | null;
  onNavigateToProfile: (userId: string) => void;
  addToast?: (msg: string, type: string) => void;
}

type PostMode = 'text' | 'photo' | 'video' | 'poll';

const AgriFeed: React.FC<AgriFeedProps> = ({
  user,
  profile,
  onNavigateToProfile,
  addToast,
}) => {
  const { t } = useLanguage();

  // ── State ──────────────────────────────────────────────────────────────────
  const [posts, setPosts]               = useState<Post[]>([]);
  const [content, setContent]           = useState('');
  const [postMode, setPostMode]         = useState<PostMode>('text');
  const [mediaFile, setMediaFile]       = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [pollOptions, setPollOptions]   = useState<string[]>(['', '']);
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [showComments, setShowComments]     = useState<Record<string, boolean>>({});
  const [postComments, setPostComments]     = useState<Record<string, any[]>>({});
  const [editingPostId, setEditingPostId]   = useState<string | null>(null);
  const [editContent, setEditContent]       = useState('');
  const [isLoading, setIsLoading]           = useState(false);
  const [isUploading, setIsUploading]       = useState(false);
  const [votingPostId, setVotingPostId]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Live feed ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });
  }, []);

  // ── Content moderation ─────────────────────────────────────────────────────
  const moderateText = async (text: string): Promise<{ safe: boolean; reason?: string }> => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'moderateContent', data: { text } }),
      });
      if (!res.ok) return { safe: true };
      return await res.json();
    } catch {
      return { safe: true }; // allow through if server unreachable
    }
  };

  // ── Media handling ─────────────────────────────────────────────────────────
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Create post ────────────────────────────────────────────────────────────
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasText    = content.trim().length > 0;
    const hasMedia   = mediaFile !== null;
    const hasPoll    = postMode === 'poll' && pollOptions.filter(o => o.trim()).length >= 2;

    if (!hasText && !hasMedia && !hasPoll) return;
    if (!user) { addToast?.('Please sign in to post', 'error'); return; }

    // Moderate text
    if (hasText) {
      const mod = await moderateText(content.trim());
      if (!mod.safe) {
        addToast?.(
          `Post blocked: ${mod.reason || 'Content not allowed. Keep AgriFeed respectful.'} 🌿`,
          'error'
        );
        return;
      }
    }

    setIsLoading(true);
    setIsUploading(hasMedia);

    try {
      // Upload media to Firebase Storage if present
      let mediaUrl  = '';
      let mediaType: 'image' | 'video' | undefined;

      if (mediaFile) {
        const ext       = mediaFile.name.split('.').pop();
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}.${ext}`);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl  = await getDownloadURL(storageRef);
        mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
      }

      const displayName = profile?.firstName
        ? `${profile.firstName} ${profile.lastName}`
        : user.displayName || 'Farmer';

      const postData: Record<string, any> = {
        userId:                user.uid,
        userDisplayName:       displayName,
        userPhotoURL:          profile?.avatarUrl || user.photoURL || '',
        userIsIndustry:        profile?.is_industry        || false,
        userIndustryVerified:  profile?.industry_verified  || false,
        userIndustryCategory:  profile?.industry_category  || '',
        content:               content.trim(),
        likes:                 0,
        likedBy:               [],
        commentCount:          0,
        createdAt:             serverTimestamp(),
      };

      if (mediaUrl)              { postData.mediaUrl = mediaUrl; postData.mediaType = mediaType; }
      if (postMode === 'poll')   {
        // Each poll option: { text, count, voters[] }
        postData.pollOptions = pollOptions
          .filter(o => o.trim())
          .map(o => ({ text: o.trim(), count: 0, voters: [] }));
      }

      await addDoc(collection(db, 'posts'), postData);

      // Reset composer
      setContent('');
      clearMedia();
      setPollOptions(['', '']);
      setPostMode('text');
      addToast?.('Post shared! 🌱', 'success');
    } catch (err: any) {
      console.error('Post error:', err);
      addToast?.('Failed to post: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  // ── Like / unlike ──────────────────────────────────────────────────────────
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) { addToast?.('Sign in to like posts', 'error'); return; }
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await updateDoc(doc(db, 'posts', postId), {
        likes:   isLiked ? post.likes - 1 : post.likes + 1,
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
      if (!isLiked && post.userId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId:      post.userId,
          title:       'New Like',
          message:     `${profile?.firstName || user.displayName || 'Someone'} liked your post`,
          type:        'like',
          link:        'agri-feed',
          fromUserId:  user.uid,
          isRead:      false,
          createdAt:   serverTimestamp(),
        });
      }
    } catch (err) { console.error('Like error:', err); }
  };

  // ── Poll voting ────────────────────────────────────────────────────────────
  const handleVote = async (postId: string, optionIndex: number) => {
    if (!user) { addToast?.('Sign in to vote', 'error'); return; }

    // Get the latest post snapshot directly from Firestore to avoid stale state
    setVotingPostId(postId);
    try {
      const postSnap = await getDoc(doc(db, 'posts', postId));
      if (!postSnap.exists()) return;

      const postData = postSnap.data();
      const options: any[] = postData.pollOptions || [];

      // Check if user already voted in ANY option
      const alreadyVoted = options.some((o: any) =>
        Array.isArray(o.voters) && o.voters.includes(user.uid)
      );

      if (alreadyVoted) {
        addToast?.('You have already voted in this poll', 'info');
        return;
      }

      if (optionIndex < 0 || optionIndex >= options.length) return;

      // Build updated options array
      const updatedOptions = options.map((o: any, i: number) => {
        if (i === optionIndex) {
          return {
            ...o,
            count:  (o.count || 0) + 1,
            voters: [...(o.voters || []), user.uid],
          };
        }
        return o;
      });

      await updateDoc(doc(db, 'posts', postId), { pollOptions: updatedOptions });
      addToast?.('Vote recorded! ✅', 'success');
    } catch (err: any) {
      console.error('Vote error:', err);
      addToast?.('Failed to vote: ' + err.message, 'error');
    } finally {
      setVotingPostId(null);
    }
  };

  // ── Comments ───────────────────────────────────────────────────────────────
  const openComments = (postId: string) => {
    const nowOpen = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: nowOpen }));

    if (nowOpen && !postComments[postId]) {
      // Subscribe to subcollection
      const q = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      onSnapshot(q, snap => {
        setPostComments(prev => ({
          ...prev,
          [postId]: snap.docs.map(d => ({ id: d.id, ...d.data() })),
        }));
      });
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentContent[postId]?.trim();
    if (!user || !text) return;

    const mod = await moderateText(text);
    if (!mod.safe) {
      addToast?.(`Comment blocked: ${mod.reason || 'Not allowed'}`, 'error');
      return;
    }

    const displayName = profile?.firstName
      ? `${profile.firstName} ${profile.lastName}`
      : user.displayName || 'Farmer';

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        postId,
        userId:          user.uid,
        userDisplayName: displayName,
        userPhotoURL:    profile?.avatarUrl || user.photoURL || '',
        content:         text,
        createdAt:       serverTimestamp(),
      });
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1),
      });

      const post = posts.find(p => p.id === postId);
      if (post && post.userId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId:      post.userId,
          title:       'New Comment',
          message:     `${displayName} commented: "${text.substring(0, 60)}${text.length > 60 ? '…' : ''}"`,
          type:        'comment',
          link:        'agri-feed',
          fromUserId:  user.uid,
          isRead:      false,
          createdAt:   serverTimestamp(),
        });
      }
      setCommentContent(prev => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      addToast?.('Failed to comment: ' + err.message, 'error');
    }
  };

  const handleDeleteComment = async (
    postId: string,
    commentId: string,
    commentUserId: string
  ) => {
    if (!user) return;
    const post  = posts.find(p => p.id === postId);
    const canDo =
      user.uid === commentUserId ||
      user.uid === post?.userId  ||
      profile?.is_admin;
    if (!canDo) return;
    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(-1),
      });
    } catch (err: any) {
      addToast?.('Delete failed: ' + err.message, 'error');
    }
  };

  // ── Edit / delete post ─────────────────────────────────────────────────────
  const handleUpdatePost = async (postId: string) => {
    if (!editContent.trim() || !user) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'posts', postId), {
        content:   editContent.trim(),
        updatedAt: serverTimestamp(),
      });
      setEditingPostId(null);
      setEditContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, authorId: string) => {
    if (!auth.currentUser || auth.currentUser.uid !== authorId) return;
    if (!window.confirm('Delete this post?')) return;
    await deleteDoc(doc(db, 'posts', postId));
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      await navigator.share({ title: 'ACA Post', text: post.content, url: window.location.href });
    } else {
      navigator.clipboard.writeText(post.content);
      addToast?.('Copied to clipboard!', 'success');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
          {t('agriCommunity')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {t('connectFarmers')}
        </p>
      </div>

      {/* ── Composer ── */}
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <form onSubmit={handlePost}>
            {/* Avatar + textarea */}
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
                {profile?.avatarUrl || user.photoURL
                  ? <img src={profile?.avatarUrl || user.photoURL} className="w-full h-full object-cover" alt="" />
                  : <UserIcon size={20} />}
              </div>
              <textarea
                placeholder={
                  postMode === 'poll'
                    ? 'Ask your farming community a question...'
                    : t('shareInsights')
                }
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-base dark:text-white min-h-[80px] outline-none"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            {/* Media preview */}
            {mediaPreview && (
              <div className="mt-4 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {mediaFile?.type.startsWith('video')
                  ? <video src={mediaPreview} controls className="w-full max-h-64 object-cover" />
                  : <img src={mediaPreview} className="w-full max-h-64 object-cover" alt="Preview" />}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Poll builder */}
            {postMode === 'poll' && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Poll Options (min 2, max 4)
                </p>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}${i < 2 ? ' *' : ' (optional)'}`}
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20"
                      value={opt}
                      onChange={e =>
                        setPollOptions(prev => prev.map((o, j) => (j === i ? e.target.value : o)))
                      }
                    />
                    {i >= 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(prev => prev.filter((_, j) => j !== i))}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions(prev => [...prev, ''])}
                    className="flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest hover:opacity-80"
                  >
                    <Plus size={14} /> Add option
                  </button>
                )}
              </div>
            )}

            {/* Toolbar */}
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={postMode === 'video' ? 'video/*' : 'image/*'}
                onChange={handleMediaSelect}
              />

              {/* Mode buttons */}
              <div className="flex gap-1">
                {([
                  { mode: 'photo' as PostMode, icon: ImageIcon, label: 'Photo' },
                  { mode: 'video' as PostMode, icon: Video,     label: 'Video' },
                  { mode: 'poll'  as PostMode, icon: BarChart2,  label: 'Poll'  },
                ] as const).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (mode === 'poll') {
                        setPostMode(postMode === 'poll' ? 'text' : 'poll');
                        return;
                      }
                      setPostMode(mode);
                      clearMedia();
                      setTimeout(() => fileInputRef.current?.click(), 50);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                      postMode === mode
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                        : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    )}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || (!content.trim() && !mediaFile && postMode !== 'poll')}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all active:scale-95"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {isLoading
                  ? isUploading ? 'Uploading…' : 'Posting…'
                  : t('post')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Feed ── */}
      <div className="space-y-6">
        <AnimatePresence>
          {posts.map(post => {
            const isLiked        = user ? (post.likedBy || []).includes(user.uid) : false;
            const commentCount   = (post as any).commentCount ?? (post.comments?.length ?? 0);
            const pollOptions_   = (post as any).pollOptions as any[] | undefined;
            const totalVotes     = pollOptions_
              ? pollOptions_.reduce((s: number, o: any) => s + (o.count || 0), 0)
              : 0;
            const userVotedIndex = pollOptions_
              ? pollOptions_.findIndex((o: any) =>
                  Array.isArray(o.voters) && user && o.voters.includes(user.uid)
                )
              : -1;
            const hasVoted = userVotedIndex !== -1;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  {/* ── Post header ── */}
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={() => onNavigateToProfile(post.userId)}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {post.userPhotoURL
                          ? <img src={post.userPhotoURL} className="w-full h-full object-cover" alt="" />
                          : <UserIcon size={20} className="text-primary-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-gray-900 dark:text-white text-sm leading-none">
                            {post.userDisplayName}
                          </span>
                          {(post as any).userIndustryVerified && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-200 dark:border-amber-700 rounded-full">
                              <BadgeCheck size={9} />
                              {(post as any).userIndustryCategory || 'Industry'}
                            </span>
                          )}
                          {(post as any).isAd && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-700 rounded-full">
                              <Star size={9} /> Sponsored
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Clock size={11} />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </button>

                    {/* Edit / delete own post */}
                    {auth.currentUser?.uid === post.userId && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }}
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, post.userId)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Industry product contact ── */}
                  {(post as any).isAd &&
                    ((post as any).adContactEmail || (post as any).adContactPhone) && (
                    <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex flex-wrap gap-3">
                      <p className="w-full text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        Contact for this product:
                      </p>
                      {(post as any).adContactEmail && (
                        <a href={`mailto:${(post as any).adContactEmail}`}
                          className="flex items-center gap-1 text-xs text-amber-700 font-bold hover:underline">
                          <Mail size={12} /> {(post as any).adContactEmail}
                        </a>
                      )}
                      {(post as any).adContactPhone && (
                        <a href={`tel:${(post as any).adContactPhone}`}
                          className="flex items-center gap-1 text-xs text-amber-700 font-bold hover:underline">
                          <Phone size={12} /> {(post as any).adContactPhone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* ── Content / Edit ── */}
                  {editingPostId === post.id ? (
                    <div className="mb-5 space-y-3">
                      <textarea
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm dark:text-white min-h-[80px] outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdatePost(post.id)}
                          disabled={!editContent.trim() || isLoading}
                          className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all"
                        >
                          {isLoading ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    post.content && (
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap mb-5 text-sm">
                        {post.content}
                      </p>
                    )
                  )}

                  {/* ── Media ── */}
                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden mb-5 border border-gray-100 dark:border-gray-700">
                      {post.mediaType === 'video'
                        ? <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
                        : <img src={post.mediaUrl} alt="" className="w-full max-h-96 object-cover" />}
                    </div>
                  )}

                  {/* ── Poll ── */}
                  {pollOptions_ && pollOptions_.length > 0 && (
                    <div className="mb-5 space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                        📊 Poll · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                        {hasVoted && ' · ✅ You voted'}
                      </p>
                      {pollOptions_.map((option: any, i: number) => {
                        const pct = totalVotes > 0
                          ? Math.round(((option.count || 0) / totalVotes) * 100)
                          : 0;
                        const isMyVote   = userVotedIndex === i;
                        const isVoting   = votingPostId === post.id;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => !hasVoted && !isVoting && handleVote(post.id, i)}
                            disabled={hasVoted || isVoting || !user}
                            className={cn(
                              'w-full relative px-4 py-3 rounded-2xl border text-left transition-all overflow-hidden',
                              isMyVote
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : hasVoted || !user
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 cursor-default'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer'
                            )}
                          >
                            {/* Progress fill */}
                            {(hasVoted || totalVotes > 0) && (
                              <div
                                className={cn(
                                  'absolute inset-y-0 left-0 rounded-2xl transition-all duration-500',
                                  isMyVote
                                    ? 'bg-primary-200 dark:bg-primary-800/40'
                                    : 'bg-gray-200 dark:bg-gray-700/50'
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            )}
                            <div className="relative flex items-center justify-between">
                              <span className={cn(
                                'text-sm font-bold',
                                isMyVote
                                  ? 'text-primary-700 dark:text-primary-300'
                                  : 'text-gray-800 dark:text-gray-200'
                              )}>
                                {isMyVote && <CheckCircle2 size={14} className="inline mr-1.5 text-primary-600" />}
                                {option.text}
                              </span>
                              {(hasVoted || totalVotes > 0) && (
                                <span className={cn(
                                  'text-xs font-black ml-2 shrink-0',
                                  isMyVote ? 'text-primary-600' : 'text-gray-400'
                                )}>
                                  {pct}%
                                </span>
                              )}
                              {isVoting && i === 0 && (
                                <Loader2 size={14} className="animate-spin text-primary-500 ml-2" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {!user && (
                        <p className="text-xs text-gray-400 font-medium text-center pt-1">
                          Sign in to vote
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="flex items-center gap-5 pt-4 border-t border-gray-50 dark:border-gray-700">
                    <button
                      onClick={() => handleLike(post.id, isLiked)}
                      className={cn(
                        'flex items-center gap-2 text-sm font-black transition-colors',
                        isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      )}
                    >
                      <Heart size={19} fill={isLiked ? 'currentColor' : 'none'} />
                      {post.likes || 0}
                    </button>

                    <button
                      onClick={() => openComments(post.id)}
                      className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <MessageSquare size={19} />
                      {commentCount}
                    </button>

                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Share2 size={19} />
                      {t('share')}
                    </button>
                  </div>

                  {/* ── Comments ── */}
                  {showComments[post.id] && (
                    <div className="mt-5 pt-5 border-t border-gray-50 dark:border-gray-700 space-y-3">
                      {/* Loading */}
                      {!postComments[post.id] && (
                        <div className="flex items-center gap-2 py-4 justify-center">
                          <Loader2 size={16} className="animate-spin text-primary-400" />
                          <span className="text-xs text-gray-400">Loading comments…</span>
                        </div>
                      )}

                      {/* Empty */}
                      {postComments[post.id]?.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-3">
                          No comments yet — be the first! 💬
                        </p>
                      )}

                      {/* Comment list */}
                      {(postComments[post.id] || []).map((comment: any) => {
                        const canDelete =
                          user &&
                          (user.uid === comment.userId ||
                           user.uid === post.userId ||
                           profile?.is_admin);
                        return (
                          <div key={comment.id} className="flex gap-3 group">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                              {comment.userPhotoURL
                                ? <img src={comment.userPhotoURL} className="w-full h-full object-cover" alt="" />
                                : <UserIcon size={14} className="text-gray-500" />}
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-4 py-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-black text-gray-900 dark:text-white">
                                  {comment.userDisplayName}
                                </p>
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteComment(post.id, comment.id, comment.userId)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 rounded-lg"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                {comment.content}
                              </p>
                              {comment.createdAt?.toDate && (
                                <p className="text-[10px] text-gray-400 font-bold mt-1">
                                  {new Date(comment.createdAt.toDate()).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Comment input */}
                      {user ? (
                        <div className="flex gap-3 pt-1">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                            {profile?.avatarUrl || user.photoURL
                              ? <img src={profile?.avatarUrl || user.photoURL} className="w-full h-full object-cover rounded-xl" alt="" />
                              : <UserIcon size={14} className="text-primary-600" />}
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              placeholder="Write a comment… (Enter to send)"
                              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl py-2.5 pl-4 pr-12 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20"
                              value={commentContent[post.id] || ''}
                              onChange={e =>
                                setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(post.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleComment(post.id)}
                              disabled={!commentContent[post.id]?.trim()}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-30"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-xs text-gray-400 py-2">
                          Sign in to comment
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {posts.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xl mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 font-medium">
              Be the first to share something with the farming community!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriFeed;

import { useState, useEffect, useRef } from 'react';
import {
    fetchLandingPageContent,
    fetchLandingPageTheme,
    fetchLandingPageStatistics,
    updateLandingPageSection,
    updateLandingPageTheme,
    fetchChatbotConfig,
    updateChatbotConfig
} from '../services/adminService';
import { usePage } from '../contexts/PageContext';

const LANDING_PAGE_URL = import.meta.env.VITE_LANDING_PAGE_URL;

// Cập nhật: Sử dụng biến môi trường cho an toàn và linh hoạt. hihi!

const LandingPage = () => {
    const { setPageInfo } = usePage();
    const [content, setContent] = useState({});
    const [theme, setTheme] = useState({});
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatConfig, setChatConfig] = useState({
        botName: '',
        personality: '',
        suggestedQuestions: [],
        errorMessage: '',
        rateLimitMessage: '',
        modelNotFoundMessage: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('hero');
    const [isMobilePreview, setIsMobilePreview] = useState(false);

    // Preview Ref
    const previewWrapperRef = useRef(null);

    // Dummy stats for preview
    const dummyStats = {
        totalUsers: 1250,
        totalTopics: 45,
        totalVocabulary: 3200,
        totalGrammar: 150
    };

    useEffect(() => {
        setPageInfo({
            title: 'Quản Lý Landing Page',
            description: 'Chỉnh sửa nội dung và giao diện trang Landing Page',
            actions: (
                <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={loadData}
                >
                    <i className="fas fa-rotate me-2"></i>
                    Làm mới
                </button>
            )
        });
        loadData();
        return () => setPageInfo({ title: '', description: '', actions: null });
    }, [setPageInfo]);

    // Send updates to iframe whenever content or theme changes
    useEffect(() => {
        if (!previewWrapperRef.current) return;

        const iframe = previewWrapperRef.current;

        const sendMessage = () => {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BEELINGUAL_PREVIEW_UPDATE',
                    data: { content, theme }
                }, '*'); // Use '*' for development
            }
        };

        sendMessage();
        iframe.addEventListener('load', sendMessage);
        return () => iframe.removeEventListener('load', sendMessage);
    }, [content, theme]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [contentData, themeData, statsData, chatData] = await Promise.all([
                fetchLandingPageContent(),
                fetchLandingPageTheme(),
                fetchLandingPageStatistics(),
                fetchChatbotConfig()
            ]);
            setContent(contentData.data || {});
            setTheme(themeData.data || {});
            setStats(statsData.data || null);
            setChatConfig(chatData.data || {});
        } catch (error) {
            showMessage('danger', 'Lỗi khi tải dữ liệu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleSaveSection = async (section) => {
        try {
            setSaving(true);
            await updateLandingPageSection(section, content[section]);
            showMessage('success', `Đã lưu ${section} section thành công!`);
        } catch (error) {
            showMessage('danger', 'Lỗi khi lưu: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTheme = async () => {
        try {
            setSaving(true);
            await updateLandingPageTheme(theme);
            showMessage('success', 'Đã lưu theme thành công!');
        } catch (error) {
            showMessage('danger', 'Lỗi khi lưu theme: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveChatbotConfig = async () => {
        try {
            setSaving(true);
            await updateChatbotConfig(chatConfig);
            showMessage('success', 'Đã lưu cấu hình chatbot thành công hihi!');
        } catch (error) {
            showMessage('danger', 'Lỗi khi lưu cấu hình chatbot: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const updateContent = (section, key, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const updateFeature = (index, field, value) => {
        const features = [...(content.features?.features || [])];
        features[index] = { ...features[index], [field]: value };
        setContent(prev => ({
            ...prev,
            features: {
                ...prev.features,
                features
            }
        }));
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="text-center">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">


            {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                </div>
            )}

            <div className="row g-4">
                {/* Editor Column */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Chỉnh sửa nội dung</h5>
                        </div>
                        <div className="card-body">
                            {/* Tabs Navigation */}
                            <ul className="nav nav-tabs mb-4" role="tablist">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'hero' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('hero')}
                                    >
                                        Hero Section
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('features')}
                                    >
                                        Features
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'download' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('download')}
                                    >
                                        Download
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'footer' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('footer')}
                                    >
                                        Footer
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'theme' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('theme')}
                                    >
                                        Theme (Màu sắc)
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'chatbot' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('chatbot')}
                                    >
                                        Chatbot AI
                                    </button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {/* Hero Tab */}
                                {activeTab === 'hero' && (
                                    <div className="tab-pane fade show active">
                                        <div className="mb-3">
                                            <label className="form-label">Tiêu đề chính</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.hero?.heroTitle || ''}
                                                onChange={(e) => updateContent('hero', 'heroTitle', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Phụ đề</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={content.hero?.heroSubtitle || ''}
                                                onChange={(e) => updateContent('hero', 'heroSubtitle', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">URL hình ảnh</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.hero?.heroImageUrl || ''}
                                                onChange={(e) => updateContent('hero', 'heroImageUrl', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Text nút CTA</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.hero?.heroCtaText || ''}
                                                onChange={(e) => updateContent('hero', 'heroCtaText', e.target.value)}
                                            />
                                        </div>

                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleSaveSection('hero')}
                                            disabled={saving}
                                        >
                                            {saving ? 'Đang lưu...' : 'Lưu Hero Section'}
                                        </button>
                                    </div>
                                )}

                                {/* Features Tab */}
                                {activeTab === 'features' && (
                                    <div className="tab-pane fade show active">
                                        <h5 className="mb-3">Danh sách tính năng</h5>
                                        {content.features?.features?.map((feature, index) => (
                                            <div key={index} className="card mb-3 bg-light border">
                                                <div className="card-body">
                                                    <h6>Tính năng #{index + 1}</h6>
                                                    <div className="mb-2">
                                                        <label className="form-label">Icon (emoji)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={feature.icon || ''}
                                                            onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label">Tiêu đề</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={feature.title || ''}
                                                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label">Mô tả</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows={2}
                                                            value={feature.description || ''}
                                                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label">URL hình ảnh</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={feature.imageUrl || ''}
                                                            onChange={(e) => updateFeature(index, 'imageUrl', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleSaveSection('features')}
                                            disabled={saving}
                                        >
                                            {saving ? 'Đang lưu...' : 'Lưu Features'}
                                        </button>
                                    </div>
                                )}

                                {/* Download Tab */}
                                {activeTab === 'download' && (
                                    <div className="tab-pane fade show active">
                                        <div className="mb-3">
                                            <label className="form-label">Tiêu đề</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.download?.downloadTitle || ''}
                                                onChange={(e) => updateContent('download', 'downloadTitle', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Mô tả</label>
                                            <textarea
                                                className="form-control"
                                                rows={2}
                                                value={content.download?.downloadDescription || ''}
                                                onChange={(e) => updateContent('download', 'downloadDescription', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Link iOS</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.download?.iosLink || ''}
                                                onChange={(e) => updateContent('download', 'iosLink', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Link Android</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.download?.androidLink || ''}
                                                onChange={(e) => updateContent('download', 'androidLink', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Link APK</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.download?.apkLink || ''}
                                                onChange={(e) => updateContent('download', 'apkLink', e.target.value)}
                                            />
                                        </div>

                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleSaveSection('download')}
                                            disabled={saving}
                                        >
                                            {saving ? 'Đang lưu...' : 'Lưu Download Section'}
                                        </button>
                                    </div>
                                )}

                                {/* Footer Tab */}
                                {activeTab === 'footer' && (
                                    <div className="tab-pane fade show active">
                                        <div className="mb-3">
                                            <label className="form-label">Mô tả Footer</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={content.footer?.footerDescription || ''}
                                                onChange={(e) => updateContent('footer', 'footerDescription', e.target.value)}
                                            />
                                        </div>

                                        <h6>Social Links</h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Facebook</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={content.footer?.socialLinks?.facebook || ''}
                                                        onChange={(e) => setContent(prev => ({
                                                            ...prev,
                                                            footer: {
                                                                ...prev.footer,
                                                                socialLinks: {
                                                                    ...prev.footer?.socialLinks,
                                                                    facebook: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Instagram</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={content.footer?.socialLinks?.instagram || ''}
                                                        onChange={(e) => setContent(prev => ({
                                                            ...prev,
                                                            footer: {
                                                                ...prev.footer,
                                                                socialLinks: {
                                                                    ...prev.footer?.socialLinks,
                                                                    instagram: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Twitter</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={content.footer?.socialLinks?.twitter || ''}
                                                        onChange={(e) => setContent(prev => ({
                                                            ...prev,
                                                            footer: {
                                                                ...prev.footer,
                                                                socialLinks: {
                                                                    ...prev.footer?.socialLinks,
                                                                    twitter: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Youtube</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={content.footer?.socialLinks?.youtube || ''}
                                                        onChange={(e) => setContent(prev => ({
                                                            ...prev,
                                                            footer: {
                                                                ...prev.footer,
                                                                socialLinks: {
                                                                    ...prev.footer?.socialLinks,
                                                                    youtube: e.target.value
                                                                }
                                                            }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={content.footer?.contactEmail || ''}
                                                onChange={(e) => updateContent('footer', 'contactEmail', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Số điện thoại</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={content.footer?.contactPhone || ''}
                                                onChange={(e) => updateContent('footer', 'contactPhone', e.target.value)}
                                            />
                                        </div>

                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleSaveSection('footer')}
                                            disabled={saving}
                                        >
                                            {saving ? 'Đang lưu...' : 'Lưu Footer'}
                                        </button>
                                    </div>
                                )}

                                {/* Theme Tab */}
                                {activeTab === 'theme' && (
                                    <div className="tab-pane fade show active">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Màu chủ đạo (Primary)</label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={theme.primaryColor || '#ffc107'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={theme.primaryColor || '#ffc107'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Màu phụ (Accent/Warning)</label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={theme.accentColor || '#ffdb4d'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={theme.accentColor || '#ffdb4d'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Màu phụ 2 (Secondary/Navy)</label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={theme.secondaryColor || '#1a1d29'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={theme.secondaryColor || '#1a1d29'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Màu nền (Background)</label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={theme.backgroundColor || '#0f1117'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={theme.backgroundColor || '#0f1117'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Màu chữ (Text)</label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={theme.textColor || '#ffffff'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={theme.textColor || '#ffffff'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Gradient Start</label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={theme.gradientStart || '#ffc107'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, gradientStart: e.target.value }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={theme.gradientStart || '#ffc107'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, gradientStart: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Gradient End</label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={theme.gradientEnd || '#ffdb4d'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, gradientEnd: e.target.value }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={theme.gradientEnd || '#ffdb4d'}
                                                            onChange={(e) => setTheme(prev => ({ ...prev, gradientEnd: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-warning"
                                            onClick={handleSaveTheme}
                                            disabled={saving}
                                        >
                                            {saving ? 'Đang lưu...' : 'Lưu Theme'}
                                        </button>
                                    </div>
                                )}

                                {/* Chatbot AI Tab hihi */}
                                {activeTab === 'chatbot' && (
                                    <div className="tab-pane fade show active">
                                        <div className="mb-3">
                                            <label className="form-label">Tên Bot (Hiển thị)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={chatConfig.botName || ''}
                                                onChange={(e) => setChatConfig(prev => ({ ...prev, botName: e.target.value }))}
                                                placeholder="Ví dụ: Bee-Bot"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Lời chào mặc định (Welcome Message)</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={chatConfig.welcomeMessage || ''}
                                                onChange={(e) => setChatConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                                                placeholder="Lời chào khi người dùng vừa mở chatbot..."
                                            ></textarea>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tính cách / Chỉ dẫn (Personality)</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={chatConfig.personality || ''}
                                                onChange={(e) => setChatConfig(prev => ({ ...prev, personality: e.target.value }))}
                                                placeholder="Hướng dẫn cho AI biết nó là ai và trả lời như thế nào..."
                                            ></textarea>
                                        </div>

                                        <hr />
                                        <h6 className="mb-3">Thông báo lỗi (Custom Messages)</h6>
                                        <div className="mb-3">
                                            <label className="form-label">Lỗi hệ thống chung</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={chatConfig.errorMessage || ''}
                                                onChange={(e) => setChatConfig(prev => ({ ...prev, errorMessage: e.target.value }))}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Lỗi hết lượt dùng (Rate Limit)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={chatConfig.rateLimitMessage || ''}
                                                onChange={(e) => setChatConfig(prev => ({ ...prev, rateLimitMessage: e.target.value }))}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Lỗi không tìm thấy Model</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={chatConfig.modelNotFoundMessage || ''}
                                                onChange={(e) => setChatConfig(prev => ({ ...prev, modelNotFoundMessage: e.target.value }))}
                                            />
                                        </div>

                                        <hr />
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0">Câu hỏi gợi ý</h6>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setChatConfig(prev => ({
                                                    ...prev,
                                                    suggestedQuestions: [...(prev.suggestedQuestions || []), { text: '', label: '' }]
                                                }))}
                                            >
                                                <i className="fas fa-plus me-1"></i> Thêm câu hỏi
                                            </button>
                                        </div>

                                        {(chatConfig.suggestedQuestions || []).map((q, idx) => (
                                            <div key={idx} className="card bg-light mb-3 p-3 position-relative">
                                                <button
                                                    className="btn-close position-absolute top-0 end-0 m-2"
                                                    style={{ fontSize: '0.7rem' }}
                                                    onClick={() => setChatConfig(prev => ({
                                                        ...prev,
                                                        suggestedQuestions: prev.suggestedQuestions.filter((_, i) => i !== idx)
                                                    }))}
                                                ></button>
                                                <div className="row g-2">
                                                    <div className="col-md-5">
                                                        <label className="small text-muted">Nhãn nút (Label)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={q.label}
                                                            onChange={(e) => {
                                                                const newQs = [...chatConfig.suggestedQuestions];
                                                                newQs[idx].label = e.target.value;
                                                                setChatConfig(prev => ({ ...prev, suggestedQuestions: newQs }));
                                                            }}
                                                            placeholder="Ví dụ: Khám phá app"
                                                        />
                                                    </div>
                                                    <div className="col-md-7">
                                                        <label className="small text-muted">Câu hỏi gửi đi (Text)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={q.text}
                                                            onChange={(e) => {
                                                                const newQs = [...chatConfig.suggestedQuestions];
                                                                newQs[idx].text = e.target.value;
                                                                setChatConfig(prev => ({ ...prev, suggestedQuestions: newQs }));
                                                            }}
                                                            placeholder="Ví dụ: App này có gì hay cụ?"
                                                        />
                                                    </div>
                                                    <div className="col-12 mt-2">
                                                        <label className="small text-muted">Câu trả lời đúng (Factual Response - Để Bot dựa vào trả lời)</label>
                                                        <textarea
                                                            className="form-control form-control-sm"
                                                            rows="2"
                                                            value={q.response || ''}
                                                            onChange={(e) => {
                                                                const newQs = [...chatConfig.suggestedQuestions];
                                                                newQs[idx].response = e.target.value;
                                                                setChatConfig(prev => ({ ...prev, suggestedQuestions: newQs }));
                                                            }}
                                                            placeholder="Thông tin thật bạn muốn bot cung cấp (VD: Link tải là render.com/...)"
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            className="btn btn-warning mt-3"
                                            onClick={handleSaveChatbotConfig}
                                            disabled={saving}
                                        >
                                            {saving ? 'Đang lưu...' : 'Lưu cấu hình Chatbot'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview Column */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm border-0 sticky-top" style={{
                        top: '24px',
                        height: 'calc(100vh - 160px)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10
                    }}>
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Live Preview</h5>
                            <div className="d-flex align-items-center gap-2">
                                <div className="btn-group btn-group-sm">
                                    <button
                                        className={`btn ${!isMobilePreview ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setIsMobilePreview(false)}
                                    >
                                        <i className="bi bi-laptop me-1"></i> Desktop
                                    </button>
                                    <button
                                        className={`btn ${isMobilePreview ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setIsMobilePreview(true)}
                                    >
                                        <i className="bi bi-smartphone me-1"></i> Mobile
                                    </button>
                                </div>
                                <span className="badge bg-success ms-2">Live Updates</span>
                            </div>
                        </div>
                        <div className="card-body p-0" style={{
                            flex: 1,
                            overflowY: 'auto',
                            background: isMobilePreview ? '#f0f2f5' : 'transparent',
                            display: 'flex',
                            justifyContent: 'center',
                            padding: isMobilePreview ? '20px 0' : '0'
                        }}>
                            <iframe
                                src={LANDING_PAGE_URL}
                                ref={previewWrapperRef}
                                style={{
                                    width: isMobilePreview ? '375px' : '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: isMobilePreview ? '20px' : '0',
                                    boxShadow: isMobilePreview ? '0 0 20px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.3s ease',
                                    margin: '0 auto'
                                }}
                                title="Beelingual Landing Page Preview"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

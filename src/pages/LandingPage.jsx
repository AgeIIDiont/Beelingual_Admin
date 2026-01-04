import { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
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

// Import sub-components
import {
    SkeletonLoading,
    TabNavigation,
    HeroSection,
    FeaturesSection,
    DownloadSection,
    FooterSection,
    ThemeSection,
    ChatbotSection,
    PreviewPanel
} from '../components/LandingPage';
import '../components/LandingPage/styles/landing-page.scss';

const LANDING_PAGE_URL = import.meta.env.VITE_LANDING_PAGE_URL;

const LandingPage = () => {
    const { setPageInfo } = usePage();
    const [content, setContent] = useState({});
    const [theme, setTheme] = useState({});
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
    // const [message, setMessage] = useState({ type: '', text: '' }); // Removed
    const [activeTab, setActiveTab] = useState('hero');
    const [isMobilePreview, setIsMobilePreview] = useState(false);

    const previewWrapperRef = useRef(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [contentData, themeData, _statsData, chatData] = await Promise.all([
                fetchLandingPageContent(),
                fetchLandingPageTheme(),
                fetchLandingPageStatistics(),
                fetchChatbotConfig()
            ]);
            setContent(contentData.data || {});
            setTheme(themeData.data || {});
            setChatConfig(chatData.data || {});
        } catch (error) {
            Swal.fire('Lỗi', 'Lỗi khi tải dữ liệu: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setPageInfo({
            title: 'Quản Lý Trang Giới Thiệu',
            description: 'Chỉnh sửa nội dung và giao diện Trang Giới Thiệu',
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
    }, [setPageInfo, loadData]);

    // Send updates to iframe whenever content or theme changes
    useEffect(() => {
        if (!previewWrapperRef.current) return;
        const iframe = previewWrapperRef.current;
        const sendMessage = () => {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BEELINGUAL_PREVIEW_UPDATE',
                    data: { content, theme }
                }, LANDING_PAGE_URL || '*');
            }
        };
        sendMessage();
        iframe.addEventListener('load', sendMessage);
        return () => iframe.removeEventListener('load', sendMessage);
    }, [content, theme]);

    // const showMessage... Removed

    const handleSaveSection = async (section) => {
        try {
            setSaving(true);
            await updateLandingPageSection(section, content[section]);
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: `Đã lưu ${section} section thành công!`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Lỗi khi lưu: ' + error.message
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTheme = async () => {
        try {
            setSaving(true);
            await updateLandingPageTheme(theme);
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã lưu theme thành công!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Lỗi khi lưu theme: ' + error.message
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveChatbotConfig = async () => {
        try {
            setSaving(true);
            await updateChatbotConfig(chatConfig);
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã lưu cấu hình chatbot thành công!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Lỗi khi lưu cấu hình chatbot: ' + error.message
            });
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

    // Show skeleton loading
    if (loading) {
        return <SkeletonLoading />;
    }

    // Render active tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'hero':
                return (
                    <HeroSection
                        content={content}
                        onContentChange={updateContent}
                        onSave={handleSaveSection}
                        saving={saving}
                    />
                );
            case 'features':
                return (
                    <FeaturesSection
                        content={content}
                        onFeatureChange={updateFeature}
                        onSave={handleSaveSection}
                        saving={saving}
                    />
                );
            case 'download':
                return (
                    <DownloadSection
                        content={content}
                        onContentChange={updateContent}
                        onSave={handleSaveSection}
                        saving={saving}
                    />
                );
            case 'footer':
                return (
                    <FooterSection
                        content={content}
                        setContent={setContent}
                        onContentChange={updateContent}
                        onSave={handleSaveSection}
                        saving={saving}
                    />
                );
            case 'theme':
                return (
                    <ThemeSection
                        theme={theme}
                        setTheme={setTheme}
                        onSave={handleSaveTheme}
                        saving={saving}
                    />
                );
            case 'chatbot':
                return (
                    <ChatbotSection
                        chatConfig={chatConfig}
                        setChatConfig={setChatConfig}
                        onSave={handleSaveChatbotConfig}
                        saving={saving}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Alert Message */}

            <div className="row g-4">
                {/* Editor Column */}
                <div className="col-lg-6 mb-4">
                    <div className="lp-card sticky-top" style={{
                        top: '24px',
                        height: 'calc(100vh - 50px)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10
                    }}>
                        <div className="lp-card-header">
                            <h5>
                                <i className="fas fa-edit text-warning me-2"></i>
                                Chỉnh sửa nội dung
                            </h5>
                        </div>
                        <div className="lp-card-body" style={{ flex: 1, overflowY: 'auto' }}>
                            {/* Tab Navigation */}
                            <TabNavigation
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />

                            {/* Tab Content */}
                            <div className="tab-content">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="col-lg-6 mb-4">
                    <PreviewPanel
                        iframeRef={previewWrapperRef}
                        isMobilePreview={isMobilePreview}
                        setIsMobilePreview={setIsMobilePreview}
                        previewUrl={LANDING_PAGE_URL}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

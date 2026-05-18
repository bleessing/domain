import { useNavigate } from 'react-router';
import { Layout, Typography, Row, Col, Card, Space } from 'antd';
import { ApiOutlined, ToolOutlined, ColumnHeightOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { EquipmentType } from '@/shared/lib/equipment';
import { EQUIPMENT_LABELS, ALL_EQUIPMENT } from '@/shared/lib/equipment';
import { colors } from '@/shared/lib/theme';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const EQUIPMENT_DESCRIPTIONS: Record<EquipmentType, string> = {
    PIPES: 'Анализ движения насосно-компрессорных труб: остатки, ремонты, отгрузки и поступления.',
    PUMPS: 'Глубинные штанговые насосы: учёт состояний, движение по этапам, баланс по периоду.',
    RODS: 'Насосные штанги: контроль остатков и движение между состояниями.',
};

const EQUIPMENT_ICONS: Record<EquipmentType, React.ReactNode> = {
    PIPES: <ApiOutlined style={{ fontSize: 48 }} />,
    PUMPS: <ToolOutlined style={{ fontSize: 48 }} />,
    RODS: <ColumnHeightOutlined style={{ fontSize: 48 }} />,
};

const MainPage = () => {
    const navigate = useNavigate();

    const handleSelect = (eq: EquipmentType) => {
        navigate(`/upload?eq=${eq}`);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Тонкая фирменная полоса вверху вместо шапки с лого/названием. */}
            <div
                style={{
                    height: 4,
                    background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accent} 50%, ${colors.primary} 50%, ${colors.primary} 100%)`,
                }}
                aria-hidden
            />

            <Content style={{ padding: '48px 24px', maxWidth: 1180, margin: '0 auto', width: '100%' }}>
                <Space direction="vertical" size={8} style={{ marginBottom: 40 }}>
                    <Title level={2} style={{ margin: 0, color: colors.text }}>
                        Выберите тип оборудования
                    </Title>
                    <Paragraph style={{ margin: 0, color: colors.textMuted, fontSize: 15 }}>
                        От этого зависит набор фильтров, формат таблиц и логика расчётов.
                    </Paragraph>
                </Space>

                <Row gutter={[24, 24]}>
                    {ALL_EQUIPMENT.map((eq) => (
                        <Col xs={24} md={8} key={eq}>
                            <Card
                                hoverable
                                onClick={() => handleSelect(eq)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSelect(eq);
                                    }
                                }}
                                style={{
                                    height: '100%',
                                    border: `1px solid ${colors.border}`,
                                    transition: 'all 0.2s ease',
                                }}
                                styles={{ body: { padding: 28 } }}
                            >
                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <div
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(0, 154, 68, 0.10)',
                                            color: colors.primary,
                                            borderLeft: `3px solid ${colors.accent}`,
                                        }}
                                    >
                                        {EQUIPMENT_ICONS[eq]}
                                    </div>
                                    <Title level={3} style={{ margin: 0, color: colors.text }}>
                                        {EQUIPMENT_LABELS[eq]}
                                    </Title>
                                    <Paragraph
                                        style={{ margin: 0, color: colors.textMuted, minHeight: 66 }}
                                    >
                                        {EQUIPMENT_DESCRIPTIONS[eq]}
                                    </Paragraph>
                                    <Space style={{ color: colors.primary, fontWeight: 500 }}>
                                        Начать <ArrowRightOutlined />
                                    </Space>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>

            <Footer style={{ textAlign: 'center', color: colors.textMuted, background: 'transparent' }}>
                ЦТР · Платформа мониторинга оборудования
            </Footer>
        </Layout>
    );
};

export default MainPage;

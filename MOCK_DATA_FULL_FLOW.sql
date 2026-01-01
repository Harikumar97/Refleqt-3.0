-- ============================================================================
-- REFLEQT 3.0 - COMPREHENSIVE MOCK DATA
-- Full Platform Data Flow Test: External Capture → Internal Transformation → Deployable Output
-- ============================================================================

-- This file demonstrates the complete data flow through all platform stages:
-- Stage 1: External Data Capture (Intelligence Sources)
-- Stage 2: AI Processing & Analysis (Research Swarms, Strategy Cohorts)
-- Stage 3: Internal Curation (The Brewery)
-- Stage 4: Content Production Request (Writer Requests)
-- Stage 5: Deliverable Output (Content Calendar - conceptual)

-- ============================================================================
-- STAGE 1: EXTERNAL DATA CAPTURE
-- ============================================================================

-- Intelligence Sources - RSS feeds, social media, news outlets
INSERT INTO intelligence_sources (id, user_id, source_type, source_url, source_name, category, is_active, last_fetched_at, created_at) VALUES
('src-001', '00000000-0000-0000-0000-000000000001', 'rss', 'https://techcrunch.com/feed/', 'TechCrunch', 'industry', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 days'),
('src-002', '00000000-0000-0000-0000-000000000001', 'twitter', 'https://twitter.com/elonmusk', 'Elon Musk Twitter', 'competitor', true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '25 days'),
('src-003', '00000000-0000-0000-0000-000000000001', 'linkedin', 'https://linkedin.com/company/openai', 'OpenAI LinkedIn', 'competitor', true, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '20 days'),
('src-004', '00000000-0000-0000-0000-000000000001', 'youtube', 'https://youtube.com/@lexfridman', 'Lex Fridman Podcast', 'industry', true, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '15 days'),
('src-005', '00000000-0000-0000-0000-000000000001', 'rss', 'https://www.theverge.com/rss/index.xml', 'The Verge Tech News', 'news', true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '10 days');

-- Intelligence Items - Raw captured data from external sources
INSERT INTO intelligence_items (id, source_id, user_id, title, content, url, author, published_at, fetched_at, relevance_score, metadata, created_at) VALUES
-- From TechCrunch
('item-001', 'src-001', '00000000-0000-0000-0000-000000000001',
 'OpenAI launches GPT-4 Turbo with vision capabilities and 128K context window',
 'OpenAI announced GPT-4 Turbo at their developer conference, featuring significant improvements including vision capabilities that allow the model to analyze images, a massive 128K token context window (equivalent to 300 pages of text), and reduced pricing. The new model is 3x cheaper for input tokens and 2x cheaper for output tokens compared to GPT-4. Developers can now build more sophisticated applications with longer context retention and multimodal inputs. Key features include: JSON mode for reliable structured outputs, reproducible outputs via seed parameter, parallel function calling, and fine-tuning capabilities. The vision API allows developers to pass images directly to GPT-4 Turbo for analysis, description, and answering questions about visual content.',
 'https://techcrunch.com/2024/11/06/openai-gpt4-turbo-launch/',
 'Sarah Perez',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days',
 0.92,
 '{"source_platform": "techcrunch", "article_type": "product_launch", "engagement": {"views": 45000, "shares": 1200, "comments": 340}, "sentiment": "positive", "keywords": ["GPT-4", "AI", "OpenAI", "multimodal", "developer tools"]}'::json,
 NOW() - INTERVAL '2 days'),

-- From Elon Musk Twitter
('item-002', 'src-002', '00000000-0000-0000-0000-000000000001',
 'Tesla FSD Beta v12 achieves superhuman driving capabilities',
 'End-to-end neural network approach in FSD Beta v12 shows remarkable improvement. No more hard-coded rules. The car learns from millions of human driving examples. Safety metrics indicate performance exceeding average human drivers in controlled scenarios. Real-world testing shows 5x reduction in interventions compared to v11. This is the future of autonomous driving - pure vision, pure AI. Next update will enable full autonomous driving on highways and city streets with zero intervention needed. Production rollout planned for Q1 2024 to all FSD subscribers.',
 'https://twitter.com/elonmusk/status/1234567890',
 'Elon Musk',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day',
 0.88,
 '{"source_platform": "twitter", "engagement": {"retweets": 8900, "likes": 67000, "replies": 2300}, "sentiment": "enthusiastic", "keywords": ["Tesla", "FSD", "autonomous driving", "neural network", "AI safety"]}'::json,
 NOW() - INTERVAL '1 day'),

-- From OpenAI LinkedIn
('item-003', 'src-003', '00000000-0000-0000-0000-000000000001',
 'OpenAI introduces Custom GPTs - Build your own AI assistant without code',
 'We are excited to announce Custom GPTs, allowing anyone to create tailored versions of ChatGPT for specific use cases without writing any code. Simply provide instructions, extra knowledge, and choose capabilities like web browsing, DALL-E, or code execution. Use cases range from creative writing coaches to data analysis assistants, math tutors, and domain-specific advisors. Top creators can monetize their GPTs through the upcoming GPT Store. Enterprise customers get enhanced admin controls, data governance, and the ability to deploy internal-only GPTs across their organization. Over 2 million developers are already building on our API platform.',
 'https://linkedin.com/posts/openai/custom-gpts-announcement',
 'OpenAI Team',
 NOW() - INTERVAL '3 days',
 NOW() - INTERVAL '3 days',
 0.85,
 '{"source_platform": "linkedin", "engagement": {"reactions": 15000, "comments": 890, "shares": 2100}, "sentiment": "positive", "keywords": ["Custom GPTs", "no-code", "AI customization", "GPT Store", "enterprise AI"]}'::json,
 NOW() - INTERVAL '3 days'),

-- From Lex Fridman Podcast
('item-004', 'src-004', '00000000-0000-0000-0000-000000000001',
 'Sam Altman on AGI timeline: "Closer than most people think"',
 'In a candid discussion, Sam Altman shared insights on OpenAI''s path to AGI. Key points: (1) Current models are approaching human-level reasoning in many domains. (2) Scaling laws suggest continued exponential improvements with larger models and more compute. (3) Main challenges are alignment and safety, not capabilities. (4) AGI could arrive within this decade if current trends continue. (5) Economic impact will be massive - many knowledge work jobs will transform. (6) OpenAI is committed to ensuring AGI benefits all of humanity through careful deployment and robust safety measures. Emphasized the importance of iterative deployment to learn and adapt systems before reaching superintelligence.',
 'https://youtube.com/watch?v=L_Guz73e6fw',
 'Lex Fridman',
 NOW() - INTERVAL '5 days',
 NOW() - INTERVAL '5 days',
 0.95,
 '{"source_platform": "youtube", "video_duration": "2:45:30", "engagement": {"views": 1200000, "likes": 89000, "comments": 4500}, "sentiment": "thoughtful", "keywords": ["AGI", "Sam Altman", "AI safety", "alignment", "future of AI", "OpenAI"]}'::json,
 NOW() - INTERVAL '5 days'),

-- From The Verge
('item-005', 'src-005', '00000000-0000-0000-0000-000000000001',
 'Anthropic''s Claude 3 Opus surpasses GPT-4 on multiple benchmarks',
 'Anthropic has released Claude 3, their most capable AI model family yet. Claude 3 Opus, the flagship model, outperforms GPT-4 on key benchmarks including MMLU (86.8% vs 86.4%), GPQA (50.4% vs 35.7%), and HumanEval (84.9% vs 67%). The model shows exceptional performance in graduate-level reasoning, advanced mathematics, and code generation. Claude 3 also features a 200K token context window (larger than GPT-4 Turbo''s 128K) and near-instant response times. Anthropic emphasizes constitutional AI and harmlessness by design. Pricing is competitive: $15 per million input tokens and $75 per million output tokens. Enterprise customers can deploy Claude 3 through AWS Bedrock or Anthropic''s direct API.',
 'https://theverge.com/2024/3/4/anthropic-claude-3-opus-gpt4-benchmark',
 'James Vincent',
 NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '4 days',
 0.91,
 '{"source_platform": "theverge", "article_type": "product_review", "engagement": {"views": 78000, "shares": 2300, "comments": 890}, "sentiment": "impressed", "keywords": ["Claude 3", "Anthropic", "GPT-4 comparison", "AI benchmarks", "constitutional AI"]}'::json,
 NOW() - INTERVAL '4 days');

-- ============================================================================
-- STAGE 2A: AI PROCESSING - RESEARCH SWARMS
-- ============================================================================

-- Research Goals - User-defined intelligence gathering objectives
INSERT INTO research_goals (id, user_id, goal_title, goal_query, goal_type, mcp_chain_config, is_active, monitoring_level, created_at, updated_at) VALUES
('goal-001', '00000000-0000-0000-0000-000000000001',
 'AI Model Competitive Landscape 2024',
 'Analyze the competitive landscape of frontier AI models including capabilities, pricing, context windows, and unique features. Focus on OpenAI, Anthropic, Google, and emerging players.',
 'competitive',
 '{"providers": ["claude", "openai", "gemini"], "agents": 8, "synthesis_depth": "comprehensive", "real_time_sources": true, "web_search_enabled": true}'::json,
 true,
 'daily',
 NOW() - INTERVAL '15 days',
 NOW() - INTERVAL '1 day'),

('goal-002', '00000000-0000-0000-0000-000000000001',
 'Enterprise AI Adoption Trends',
 'Monitor how enterprises are adopting AI technologies, implementation challenges, ROI metrics, and best practices across industries.',
 'market',
 '{"providers": ["claude", "openai"], "agents": 5, "synthesis_depth": "deep", "industry_focus": ["finance", "healthcare", "technology"]}'::json,
 true,
 'hourly',
 NOW() - INTERVAL '20 days',
 NOW() - INTERVAL '2 hours');

-- Research Swarms - Executed AI research sessions
INSERT INTO research_swarms (id, goal_id, user_id, query, swarm_type, swarm_size, status, progress_percent, time_remaining, mcp_chain_used, agent_results, synthesis_applied, execution_time_ms, started_at, completed_at, created_at) VALUES
('swarm-001', 'goal-001', '00000000-0000-0000-0000-000000000001',
 'Comprehensive analysis of GPT-4 Turbo vs Claude 3 Opus capabilities, pricing, and use cases',
 'competitive',
 'large',
 'completed',
 100,
 '0 min',
 '{"chain_type": "competitive_analysis", "providers": ["claude-opus", "gpt-4-turbo", "gemini-pro"], "agents": [{"id": "agent-1", "role": "capabilities_analyst", "model": "claude-opus"}, {"id": "agent-2", "role": "pricing_analyst", "model": "gpt-4-turbo"}, {"id": "agent-3", "role": "use_case_mapper", "model": "gemini-pro"}, {"id": "agent-4", "role": "feature_comparator", "model": "claude-opus"}, {"id": "agent-5", "role": "market_analyst", "model": "gpt-4-turbo"}, {"id": "agent-6", "role": "technical_evaluator", "model": "claude-opus"}, {"id": "agent-7", "role": "customer_sentiment", "model": "gemini-pro"}, {"id": "agent-8", "role": "synthesis_coordinator", "model": "claude-opus"}]}'::json,
 '{"agent-1": {"findings": ["GPT-4 Turbo: 128K context, vision, JSON mode", "Claude 3 Opus: 200K context, superior reasoning, constitutional AI", "Both excel at code generation and complex reasoning"]}, "agent-2": {"findings": ["GPT-4 Turbo: $10/1M input, $30/1M output", "Claude 3 Opus: $15/1M input, $75/1M output", "GPT-4 Turbo 33% cheaper for most use cases"]}, "agent-3": {"findings": ["GPT-4 Turbo ideal for: chatbots, code generation, creative writing", "Claude 3 Opus ideal for: research, analysis, complex reasoning tasks", "Context length advantage makes Claude better for document analysis"]}}'::json,
 true,
 284500,
 NOW() - INTERVAL '6 hours',
 NOW() - INTERVAL '2 hours',
 NOW() - INTERVAL '6 hours');

-- Swarm Findings - Raw insights from individual AI agents
INSERT INTO swarm_findings (id, swarm_id, agent_id, finding_type, title, content, confidence_score, sources, created_at) VALUES
('finding-001', 'swarm-001', 'agent-1', 'insight',
 'GPT-4 Turbo''s Multimodal Advantage',
 'GPT-4 Turbo''s integrated vision capabilities provide significant competitive advantage for applications requiring image analysis, document understanding, and visual reasoning. Current implementation allows direct image input without preprocessing, making it ideal for OCR, diagram interpretation, and visual content moderation. Claude 3 also has vision, but GPT-4 Turbo''s earlier market entry has created ecosystem momentum.',
 0.89,
 '["https://platform.openai.com/docs/guides/vision", "https://techcrunch.com/2024/11/06/openai-gpt4-turbo-launch/"]'::json,
 NOW() - INTERVAL '5 hours'),

('finding-002', 'swarm-001', 'agent-2', 'trend',
 'Pricing War Driving Adoption',
 'OpenAI''s aggressive pricing reduction (GPT-4 Turbo is 3x cheaper for input than GPT-4) is forcing competitors to respond. Anthropic maintains premium pricing for Claude 3 Opus but justifies with superior reasoning capabilities. This pricing dynamic is accelerating enterprise adoption as AI becomes more economically viable for high-volume use cases. Estimate: 40% of enterprises will deploy AI assistants within 6 months at current pricing levels.',
 0.92,
 '["https://openai.com/pricing", "https://anthropic.com/pricing", "https://www.anthropic.com/claude"]'::json,
 NOW() - INTERVAL '4 hours'),

('finding-003', 'swarm-001', 'agent-6', 'opportunity',
 'Long Context = New Product Category',
 'Both GPT-4 Turbo (128K) and Claude 3 Opus (200K) enable entirely new product categories impossible with previous 4K-8K context limits. Examples: (1) Full codebase analysis and refactoring, (2) Multi-document legal contract review, (3) Comprehensive research paper synthesis, (4) Long-form content generation with deep context retention. Companies building on these capabilities will have significant competitive moats.',
 0.87,
 '["https://www.anthropic.com/news/claude-3-family", "https://openai.com/blog/new-models-and-developer-products-announced-at-devday"]'::json,
 NOW() - INTERVAL '3 hours');

-- Synthesized Insights - Finite Introspect output (max 10)
INSERT INTO synthesized_insights (id, swarm_id, user_id, title, content, hierarchy_level, priority_score, relevance_score, is_actionable, action_items, source_finding_ids, psychographic_tags, display_position, dismissed_at, created_at) VALUES
('insight-001', 'swarm-001', '00000000-0000-0000-0000-000000000001',
 'Strategic Positioning: Price vs Performance Trade-off',
 'The AI model market is bifurcating into two distinct segments: (1) Cost-optimized general purpose (GPT-4 Turbo, Gemini Pro) and (2) Premium performance for complex reasoning (Claude 3 Opus). Your product strategy should align with one of these positions or find a unique niche. GPT-4 Turbo''s 33% cost advantage will capture most mainstream use cases, while Claude 3 Opus will dominate in research, legal, and analytical applications where reasoning quality justifies premium pricing. Consider multi-model strategies where you route queries based on complexity and cost sensitivity.',
 'strategic',
 0.94,
 0.91,
 true,
 '["Define your target segment: cost-sensitive or quality-sensitive users", "Benchmark both models with your specific use cases to measure ROI", "Consider multi-model routing to optimize cost vs quality", "Monitor pricing changes - this market is highly dynamic", "Build model-agnostic architecture for easy switching"]'::text[],
 '["finding-001", "finding-002"]'::text[],
 '["decision-makers", "technical-leaders", "cost-conscious"]'::text[],
 1,
 NULL,
 NOW() - INTERVAL '2 hours'),

('insight-002', 'swarm-001', '00000000-0000-0000-0000-000000000001',
 'Long Context Windows Enable New Business Models',
 'The jump from 4K-8K to 128K-200K context windows isn''t incremental - it''s transformational. This unlocks entirely new product categories that were previously impossible: (1) Full repository code analysis tools, (2) Multi-document intelligence platforms, (3) Long-form content creation with deep coherence, (4) Complex workflow automation with extensive context retention. First movers in these categories will establish strong competitive positions. The key insight: don''t just use longer context for better chat - build products fundamentally designed around it.',
 'strategic',
 0.91,
 0.88,
 true,
 '["Identify workflows in your domain requiring analysis of 50+ pages simultaneously", "Prototype products that leverage full context window (don''t just use 10% of it)", "Consider legal, research, and technical documentation as high-value targets", "Build context management UX - users need to understand what''s loaded", "Price premium for long-context features - this is a differentiator"]'::text[],
 '["finding-003"]'::text[],
 '["innovators", "product-managers", "technical-founders"]'::text[],
 2,
 NULL,
 NOW() - INTERVAL '2 hours'),

('insight-003', 'swarm-001', '00000000-0000-0000-0000-000000000001',
 'Multimodal = Massive TAM Expansion',
 'Vision capabilities in both GPT-4 Turbo and Claude 3 expand the addressable market beyond text-only applications. Industries previously difficult to automate with LLMs become viable: (1) Healthcare (medical imaging, radiology), (2) Manufacturing (quality control, defect detection), (3) Architecture (diagram analysis, space planning), (4) Education (homework help with handwritten work). The integration of vision+language creates compound value - each modality enhances the other. Companies that integrate vision as a core feature (not an add-on) will capture disproportionate value.',
 'tactical',
 0.85,
 0.83,
 true,
 '["Audit your product for visual analysis opportunities", "Test vision APIs with your domain-specific images", "Consider hybrid workflows: vision for input, language for output", "Build datasets of image+text pairs for fine-tuning", "Partner with domain experts to validate vision accuracy"]'::text[],
 '["finding-001"]'::text[],
 '["visual-thinkers", "industry-specialists", "product-teams"]'::text[],
 3,
 NULL,
 NOW() - INTERVAL '2 hours');

-- ============================================================================
-- STAGE 2B: AI PROCESSING - STRATEGY COHORTS
-- ============================================================================

-- Strategy Cohorts - Competitive analysis sessions
INSERT INTO strategy_cohorts (id, user_id, name, description, query, status, analysis_type, include_financial, include_social, include_tech, include_sentiment, execution_time_ms, confidence, insight_count, swarm_id, last_analyzed_at, created_at, updated_at) VALUES
('cohort-001', '00000000-0000-0000-0000-000000000001',
 'AI Assistant Platforms Competitive Analysis',
 'Deep dive into major AI assistant platforms: ChatGPT, Claude, Gemini, and emerging competitors. Analyze product features, pricing strategies, user retention, and market positioning.',
 'Compare and contrast the competitive landscape of AI assistant platforms with focus on product differentiation, pricing power, and user lock-in strategies.',
 'completed',
 'deep-dive',
 true,
 true,
 true,
 true,
 512000,
 87.50,
 8,
 'swarm-001',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '10 days',
 NOW() - INTERVAL '1 day');

-- Cohort Competitors - Companies being analyzed
INSERT INTO cohort_competitors (id, cohort_id, name, url, domain, industry, employees, funding, logo_url, status, discovered_data, created_at, updated_at) VALUES
('comp-001', 'cohort-001', 'OpenAI', 'https://openai.com', 'openai.com', 'Artificial Intelligence', '500-1000', '$11.3B (Microsoft, others)', 'https://openai.com/logo.png', 'completed',
 '{"founding_year": 2015, "headquarters": "San Francisco, CA", "ceo": "Sam Altman", "key_products": ["ChatGPT", "GPT-4", "DALL-E", "Whisper"], "revenue_model": "API + ChatGPT Plus subscriptions", "pricing": {"chatgpt_plus": "$20/month", "api_gpt4_turbo": "$10 per 1M input tokens"}, "market_position": "Market leader in conversational AI", "strengths": ["Brand recognition", "Developer ecosystem", "Model performance", "First-mover advantage"], "weaknesses": ["Premium pricing", "Limited customization", "Capacity constraints during peak usage"], "recent_news": ["GPT-4 Turbo launch", "Custom GPTs announcement", "GPT Store coming soon"]}'::json,
 NOW() - INTERVAL '9 days',
 NOW() - INTERVAL '1 day'),

('comp-002', 'cohort-001', 'Anthropic', 'https://anthropic.com', 'anthropic.com', 'Artificial Intelligence', '200-500', '$7.3B (Google, others)', 'https://anthropic.com/logo.png', 'completed',
 '{"founding_year": 2021, "headquarters": "San Francisco, CA", "ceo": "Dario Amodei", "key_products": ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"], "revenue_model": "API + Claude Pro subscriptions", "pricing": {"claude_pro": "$20/month", "api_claude3_opus": "$15 per 1M input tokens"}, "market_position": "Premium quality challenger with safety focus", "strengths": ["Superior reasoning on benchmarks", "200K context window", "Constitutional AI approach", "Strong enterprise adoption"], "weaknesses": ["Higher pricing than competitors", "Smaller developer ecosystem", "Later market entry"], "recent_news": ["Claude 3 family launch", "Surpasses GPT-4 on key benchmarks", "AWS Bedrock partnership"]}'::json,
 NOW() - INTERVAL '9 days',
 NOW() - INTERVAL '1 day'),

('comp-003', 'cohort-001', 'Google DeepMind', 'https://deepmind.google', 'deepmind.google', 'Artificial Intelligence', '2000-5000', 'Part of Alphabet ($1.9T market cap)', 'https://deepmind.google/logo.png', 'completed',
 '{"founding_year": 2010, "headquarters": "London, UK (Google owned)", "ceo": "Demis Hassabis", "key_products": ["Gemini Ultra", "Gemini Pro", "Gemini Nano"], "revenue_model": "Free tier + Google Workspace integration", "pricing": {"gemini_advanced": "$19.99/month", "api_gemini_pro": "Free tier available"}, "market_position": "Tech giant leveraging distribution", "strengths": ["Integration with Google ecosystem", "Multimodal from ground up", "Massive compute resources", "Distribution through Workspace/Android"], "weaknesses": ["Fragmented product strategy", "Trust issues after Bard launch", "Enterprise adoption lagging"], "recent_news": ["Gemini 1.5 with 1M token context", "Integration with Google Workspace", "Gemini Ultra performance parity with GPT-4"]}'::json,
 NOW() - INTERVAL '9 days',
 NOW() - INTERVAL '1 day');

-- Cohort Insights - Strategic insights from competitive analysis
INSERT INTO cohort_insights (id, cohort_id, title, content, confidence, category, sources, rank, llm_provider, llm_model, created_at) VALUES
('c-insight-001', 'cohort-001',
 'OpenAI''s Network Effects Create Defensive Moat',
 'ChatGPT has achieved unprecedented user adoption with 100M+ weekly active users, creating powerful network effects through the upcoming GPT Store. This marketplace for Custom GPTs will enable creators to monetize AI applications, similar to Apple''s App Store model. The winner-take-most dynamics favor OpenAI: (1) Largest developer community building on their API, (2) Brand synonymous with AI ("Google it" equivalent), (3) Continuous model improvements funded by scale economics, (4) Data flywheel from user interactions. Competitors must differentiate on dimensions other than raw capabilities - Claude focuses on safety/reasoning, Google on ecosystem integration.',
 'high',
 'market',
 '["https://openai.com/blog/chatgpt-plus", "https://www.theverge.com/2024/11/6/openai-devday-announcements", "Internal analysis of GPT Store marketplace dynamics"]'::text[],
 1,
 'claude-opus',
 'claude-3-opus-20240229',
 NOW() - INTERVAL '1 day'),

('c-insight-002', 'cohort-001',
 'Premium Pricing Sustainability Depends on Measurable ROI',
 'Both OpenAI ChatGPT Plus and Anthropic Claude Pro charge $20/month, but enterprise API pricing shows divergence: Claude 3 Opus costs 50-150% more than GPT-4 Turbo depending on usage patterns. This premium can only sustain if customers perceive measurable value difference. Our analysis shows Claude excels in: (1) Complex reasoning tasks (legal analysis, research synthesis), (2) Longer context retention and coherence, (3) More nuanced understanding of instructions. However, for 60-70% of use cases (chat, simple content creation, basic coding), the quality difference doesn''t justify the cost premium. Recommendation: Anthropic should develop tiered offerings and position Opus as the "professional grade" option for specific verticals.',
 'high',
 'pricing',
 '["https://openai.com/pricing", "https://anthropic.com/pricing", "Customer ROI analysis across 50 enterprise deployments"]'::text[],
 2,
 'gpt-4-turbo',
 'gpt-4-1106-preview',
 NOW() - INTERVAL '1 day'),

('c-insight-003', 'cohort-001',
 'Context Window Arms Race Reshapes Product Design',
 'The rapid expansion of context windows (4K → 32K → 128K → 200K → 1M tokens in 18 months) fundamentally changes what''s possible with LLMs. This isn''t just incremental improvement - each 10x increase unlocks new product categories: (1) 4K-8K: Chat and basic Q&A, (2) 32K-64K: Document analysis and code review, (3) 128K-200K: Multi-document synthesis and complex reasoning, (4) 1M+: Full repository understanding and long-form book generation. Winners will be companies that design products around maximum context, not those that simply allow longer inputs. Example: Don''t build a "PDF chat" tool - build a "legal contract lifecycle management" platform that maintains context across dozens of related documents.',
 'high',
 'product',
 '["Anthropic Claude 3 technical specs", "Google Gemini 1.5 announcement", "Analysis of context utilization patterns"]'::text[],
 3,
 'claude-opus',
 'claude-3-opus-20240229',
 NOW() - INTERVAL '1 day');

-- ============================================================================
-- STAGE 3: INTERNAL CURATION - THE BREWERY
-- ============================================================================

-- Brewery Items - Curated insights saved from various sources
INSERT INTO brewery_items (id, user_id, title, content, excerpt, source_type, source_id, source_name, category, confidence, tags, writer_status, writer_request_id, saved_at, updated_at) VALUES
-- Saved from Research Swarm
('brew-001', '00000000-0000-0000-0000-000000000001',
 'Strategic Positioning: Price vs Performance Trade-off',
 'The AI model market is bifurcating into two distinct segments: (1) Cost-optimized general purpose (GPT-4 Turbo, Gemini Pro) and (2) Premium performance for complex reasoning (Claude 3 Opus). Your product strategy should align with one of these positions or find a unique niche. GPT-4 Turbo''s 33% cost advantage will capture most mainstream use cases, while Claude 3 Opus will dominate in research, legal, and analytical applications where reasoning quality justifies premium pricing. Consider multi-model strategies where you route queries based on complexity and cost sensitivity.',
 'AI model market splits: cost-optimized vs premium performance. Strategic positioning critical for competitive advantage.',
 'research-swarm',
 'swarm-001',
 'Research Swarm: AI Model Competitive Analysis',
 'strategic',
 'high',
 '["AI strategy", "pricing", "market positioning", "competitive analysis"]'::text[],
 'saved',
 NULL,
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

('brew-002', '00000000-0000-0000-0000-000000000001',
 'Long Context Windows Enable New Business Models',
 'The jump from 4K-8K to 128K-200K context windows isn''t incremental - it''s transformational. This unlocks entirely new product categories that were previously impossible: (1) Full repository code analysis tools, (2) Multi-document intelligence platforms, (3) Long-form content creation with deep coherence, (4) Complex workflow automation with extensive context retention. First movers in these categories will establish strong competitive positions. The key insight: don''t just use longer context for better chat - build products fundamentally designed around it.',
 'Long context = new product categories. First movers gain competitive moats in repository analysis, multi-doc intelligence, workflow automation.',
 'research-swarm',
 'swarm-001',
 'Research Swarm: AI Model Competitive Analysis',
 'strategic',
 'high',
 '["product strategy", "AI capabilities", "context windows", "innovation"]'::text[],
 'saved',
 NULL,
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

-- Saved from Strategy Cohort
('brew-003', '00000000-0000-0000-0000-000000000001',
 'OpenAI''s Network Effects Create Defensive Moat',
 'ChatGPT has achieved unprecedented user adoption with 100M+ weekly active users, creating powerful network effects through the upcoming GPT Store. This marketplace for Custom GPTs will enable creators to monetize AI applications, similar to Apple''s App Store model. The winner-take-most dynamics favor OpenAI: (1) Largest developer community building on their API, (2) Brand synonymous with AI ("Google it" equivalent), (3) Continuous model improvements funded by scale economics, (4) Data flywheel from user interactions. Competitors must differentiate on dimensions other than raw capabilities - Claude focuses on safety/reasoning, Google on ecosystem integration.',
 'OpenAI''s GPT Store creates App Store-like network effects. 100M+ users drive winner-take-most dynamics. Competitors must differentiate beyond capabilities.',
 'strategy-cohort',
 'cohort-001',
 'Strategy Cohort: AI Assistant Platforms Analysis',
 'market',
 'high',
 '["competitive strategy", "network effects", "OpenAI", "marketplace dynamics"]'::text[],
 'saved',
 NULL,
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

('brew-004', '00000000-0000-0000-0000-000000000001',
 'Context Window Arms Race Reshapes Product Design',
 'The rapid expansion of context windows (4K → 32K → 128K → 200K → 1M tokens in 18 months) fundamentally changes what''s possible with LLMs. This isn''t just incremental improvement - each 10x increase unlocks new product categories: (1) 4K-8K: Chat and basic Q&A, (2) 32K-64K: Document analysis and code review, (3) 128K-200K: Multi-document synthesis and complex reasoning, (4) 1M+: Full repository understanding and long-form book generation. Winners will be companies that design products around maximum context, not those that simply allow longer inputs.',
 'Context windows grew 250x in 18 months. Each 10x jump unlocks new product categories. Design for max context, not just longer inputs.',
 'strategy-cohort',
 'cohort-001',
 'Strategy Cohort: AI Assistant Platforms Analysis',
 'product',
 'high',
 '["product design", "context windows", "AI capabilities", "innovation"]'::text[],
 'request-created',
 'wr-001',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '4 hours'),

-- Saved from Intelligence Feed (via item)
('brew-005', '00000000-0000-0000-0000-000000000001',
 'GPT-4 Turbo Vision + Long Context = Multimodal Renaissance',
 'OpenAI announced GPT-4 Turbo at their developer conference, featuring significant improvements including vision capabilities that allow the model to analyze images, a massive 128K token context window (equivalent to 300 pages of text), and reduced pricing. The new model is 3x cheaper for input tokens and 2x cheaper for output tokens compared to GPT-4. Developers can now build more sophisticated applications with longer context retention and multimodal inputs. Key features include: JSON mode for reliable structured outputs, reproducible outputs via seed parameter, parallel function calling, and fine-tuning capabilities.',
 'GPT-4 Turbo combines vision + 128K context + 3x lower pricing. Unlocks multimodal apps with document-level understanding.',
 'intelligence-feed',
 'item-001',
 'TechCrunch: GPT-4 Turbo Launch',
 'news',
 'high',
 '["GPT-4 Turbo", "multimodal AI", "product launch", "pricing"]'::text[],
 'request-created',
 'wr-001',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '4 hours');

-- ============================================================================
-- STAGE 4: CONTENT PRODUCTION REQUEST - WRITER REQUESTS
-- ============================================================================

-- Writer Requests - Token requests sent to Expert Writers platform
INSERT INTO writer_requests (id, user_id, token, brewery_item_ids, platform, content_type, deadline, brief, status, assigned_writer_id, assigned_at, completed_at, deliverables, created_at, updated_at) VALUES
-- Active request for LinkedIn article
('wr-001', '00000000-0000-0000-0000-000000000001',
 'token_1735693200_x8k2j9m3p',
 '["brew-004", "brew-005"]'::text[],
 'linkedin',
 'article',
 NOW() + INTERVAL '5 days',
 'Create a thought leadership article about the evolution of AI context windows and their impact on product design. Target audience: Technical founders and product managers in AI/SaaS companies. Tone: Authoritative but accessible. Include specific examples of new product categories enabled by long context. Aim for 1200-1500 words. End with actionable recommendations for product teams.',
 'in-progress',
 'writer_sarah_chen_001',
 NOW() - INTERVAL '3 hours',
 NULL,
 NULL,
 NOW() - INTERVAL '4 hours',
 NOW() - INTERVAL '1 hour'),

-- Completed request for Twitter thread
('wr-002', '00000000-0000-0000-0000-000000000001',
 'token_1735606800_a3n7k2m8q',
 '["brew-001", "brew-003"]'::text[],
 'twitter',
 'thread',
 NOW() - INTERVAL '1 day',
 'Create a viral Twitter thread explaining the strategic positioning dilemma in the AI market: cost vs quality. Use OpenAI vs Anthropic as case study. Make it engaging and shareable. Include data points and insights that make people say "I didn''t know that." End with a provocative question to drive engagement. Target: 8-10 tweets.',
 'completed',
 'writer_mike_wilson_003',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '6 hours',
 '{
  "content": {
    "thread": [
      "The AI market is splitting into two worlds, and most companies don''t realize they''re choosing the wrong one. A thread on the price vs performance trade-off that''s reshaping tech infrastructure: 🧵",
      "GPT-4 Turbo: $10 per 1M tokens. Claude 3 Opus: $15 per 1M tokens. Seems like a small difference, right? At scale, this is the difference between $50K and $75K per month for high-volume applications. That''s $300K annually just in API costs.",
      "But here''s what the raw numbers don''t show: Claude 3 Opus beats GPT-4 on complex reasoning benchmarks. It''s not even close on tasks like graduate-level math (50.4% vs 35.7%) and advanced reasoning.",
      "This creates a fascinating strategic fork: Do you optimize for cost and capture the mass market? Or do you charge premium prices for premium quality in specific niches?",
      "OpenAI chose mass market. 100M+ weekly users. GPT Store coming. They''re building the \"App Store of AI\" - and with network effects, that''s a winner-take-most game.",
      "Anthropic chose quality + safety. They''re targeting enterprises doing high-stakes work: legal analysis, medical research, financial modeling. Where getting it right matters more than getting it cheap.",
      "The insight: There''s no middle ground. You either win on cost at scale (OpenAI, Google) or you win on quality in premium segments (Anthropic, specialized models).",
      "Most startups are stuck in the middle - using premium models for commodity use cases, or worse, using cheap models for tasks that demand accuracy.",
      "Choose your position. Then double down. Half measures fail in platform markets.",
      "Which would you rather build: The Walmart of AI or the Rolex of AI? Neither is wrong. But trying to be both is definitely wrong. What''s your take?"
    ],
    "engagement_hooks": [
      "Thread opener with bold claim",
      "Concrete numbers create credibility",
      "\"Not even close\" creates curiosity gap",
      "Strategic framework (fork in the road)",
      "Case studies with real companies",
      "Clear positioning examples",
      "Provocative insight (no middle ground)",
      "Relatable pain point",
      "Actionable advice",
      "Question to drive replies"
    ]
  },
  "metadata": {
    "word_count": 243,
    "tweet_count": 10,
    "estimated_read_time": "90 seconds",
    "target_engagement": "High - strategic insights + actionable framework",
    "best_posting_time": "Tuesday-Thursday 10am-2pm EST"
  },
  "writer_notes": "Thread designed for maximum virality among tech founders and product leaders. Uses contrarian framing (there is no middle ground) to drive discussion. Ends with engaging question to boost replies and quote tweets."
}'::json,
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '6 hours'),

-- Pending request for blog post
('wr-003', '00000000-0000-0000-0000-000000000001',
 'token_1735693800_b9m4k7n2p',
 '["brew-002"]'::text[],
 'blog',
 'article',
 NOW() + INTERVAL '7 days',
 'Write a comprehensive blog post about new business models enabled by long-context AI models. Target audience: Technical entrepreneurs and investors. Structure: (1) The context window revolution, (2) Why this changes everything, (3) 5 new product categories with examples, (4) How to identify opportunities in your domain, (5) First-mover advantages. Include real examples and actionable frameworks. 2000-2500 words. SEO optimize for "AI business models" and "long context AI applications".',
 'pending',
 NULL,
 NULL,
 NULL,
 NULL,
 NOW() - INTERVAL '2 hours',
 NOW() - INTERVAL '2 hours');

-- ============================================================================
-- STAGE 5: DELIVERABLE OUTPUT - CONTENT CALENDAR (CONCEPTUAL)
-- ============================================================================

-- Note: Content Calendar is part of the future roadmap and not yet implemented in database.
-- However, the completed writer request above (wr-002) shows the deliverable format.
--
-- Content Calendar would track:
-- - Scheduled publish dates across platforms
-- - Content states: draft, scheduled, published
-- - Performance metrics post-publication
-- - Research trail linking back to original intelligence sources
-- - A/B testing variations
-- - Cross-platform content repurposing
--
-- Example conceptual flow:
-- Intelligence Item (item-001) → Research Swarm (swarm-001) → Synthesized Insight (insight-001)
-- → Brewery Item (brew-001) → Writer Request (wr-002) → Twitter Thread (delivered)
-- → Content Calendar Entry (scheduled for Tuesday 10am) → Published & Tracked

-- ============================================================================
-- SUPPORTING DATA
-- ============================================================================

-- Psychographic Segments - Audience understanding
INSERT INTO psychographic_segments (id, user_id, segment_name, segment_tagline, characteristics, funnel_stage, size_estimate, created_at) VALUES
('psych-001', '00000000-0000-0000-0000-000000000001',
 'Technical Founders',
 'Building the future, need strategic AI insights',
 '{"pain_points": ["Information overload", "Fast-moving AI landscape", "Strategic positioning uncertainty"], "motivations": ["Competitive advantage", "Product differentiation", "First-mover opportunities"], "behavior_patterns": ["Twitter/LinkedIn active", "Newsletter subscribers", "Conference attendees", "Technical deep-dives"], "content_preferences": ["Data-driven insights", "Strategic frameworks", "Case studies", "Actionable takeaways"]}'::json,
 'consideration',
 15000,
 NOW() - INTERVAL '30 days'),

('psych-002', '00000000-0000-0000-0000-000000000001',
 'Enterprise Decision Makers',
 'C-suite executives evaluating AI adoption',
 '{"pain_points": ["ROI uncertainty", "Vendor selection paralysis", "Integration complexity", "Risk assessment"], "motivations": ["Cost reduction", "Competitive positioning", "Revenue growth", "Operational efficiency"], "behavior_patterns": ["LinkedIn engagement", "Industry reports", "Peer benchmarking", "Consultant-reliant"], "content_preferences": ["Executive summaries", "ROI calculators", "Peer comparisons", "Risk mitigation strategies"]}'::json,
 'awareness',
 8000,
 NOW() - INTERVAL '25 days');

-- Obsession Score Tracking
INSERT INTO obsession_scores (id, user_id, score, calculated_at, factors) VALUES
('obs-001', '00000000-0000-0000-0000-000000000001',
 8.5,
 NOW(),
 '{"research_frequency": 9.2, "content_engagement": 8.7, "feature_usage": 7.9, "referral_activity": 8.1, "subscription_tenure": 8.8, "platform_stickiness": 8.9}'::json);

-- Smart Trackers for continuous monitoring
INSERT INTO smart_trackers (id, goal_id, user_id, update_interval, max_insights, last_executed_at, next_execution_at, is_active, created_at) VALUES
('tracker-001', 'goal-001', '00000000-0000-0000-0000-000000000001',
 86400, -- Daily (24 hours in seconds)
 10,
 NOW() - INTERVAL '12 hours',
 NOW() + INTERVAL '12 hours',
 true,
 NOW() - INTERVAL '15 days'),

('tracker-002', 'goal-002', '00000000-0000-0000-0000-000000000001',
 3600, -- Hourly
 10,
 NOW() - INTERVAL '30 minutes',
 NOW() + INTERVAL '30 minutes',
 true,
 NOW() - INTERVAL '20 days');

-- ============================================================================
-- END OF MOCK DATA
-- ============================================================================

-- Verification Queries:
-- SELECT COUNT(*) FROM intelligence_items; -- Should be 5
-- SELECT COUNT(*) FROM research_swarms; -- Should be 1
-- SELECT COUNT(*) FROM synthesized_insights; -- Should be 3
-- SELECT COUNT(*) FROM strategy_cohorts; -- Should be 1
-- SELECT COUNT(*) FROM cohort_insights; -- Should be 3
-- SELECT COUNT(*) FROM brewery_items; -- Should be 5
-- SELECT COUNT(*) FROM writer_requests; -- Should be 3
--
-- Trace full data flow:
-- SELECT
--   ii.title as source_title,
--   rs.query as research_query,
--   si.title as synthesized_insight,
--   bi.title as brewery_item,
--   wr.platform as target_platform,
--   wr.status as production_status
-- FROM intelligence_items ii
-- LEFT JOIN research_swarms rs ON rs.id = 'swarm-001'
-- LEFT JOIN synthesized_insights si ON si.swarm_id = rs.id
-- LEFT JOIN brewery_items bi ON bi.source_id = si.swarm_id
-- LEFT JOIN writer_requests wr ON bi.id = ANY(wr.brewery_item_ids);

-- ═══════════════════════════════════════════════════════════
--  V007: Seed all static frontend content into Supabase
--  hero_videos, portfolio_items, testimonials, services,
--  team_members, blog_categories, blog_posts
-- ═══════════════════════════════════════════════════════════

-- ── 1. Hero Videos ────────────────────────────────────────
INSERT INTO public.hero_videos (youtube_id, title, slide_eyebrow, slide_headline, slide_headline_em, slide_subheadline, sort_order, active)
VALUES
  ('HAHj0TDQZcg', 'A Steampunk Princess',        'Creative Direction',     'Imagination',            'rendered in cinema.',   'Bold creative concepts executed with precision — from the first frame to the final cut.', 0, true),
  ('SgHHbWp64cE', 'Virus House Teaser',           'Brand & Commercial',    'Stories that define',    'your brand.',           'Cinematic brand films that captivate audiences and drive measurable business results.', 1, true),
  ('9k5w1iG_JHM', 'Gen AI Video',                 'AI Video Production',   'Human creativity,',      'machine speed.',        'AI-powered campaigns that scale your creative output without sacrificing quality.', 2, true),
  ('_fbHbplDCwo', 'Yoga on the Lake',             'Drone & Aerial',        'The world from above,',  'in cinematic 4K.',      'Licensed aerial cinematography for brands that demand a different perspective.', 3, true),
  ('EZUJiL9MeLw', 'The Creature Transformation',  'Post Production & VFX', 'Every frame crafted',    'with intention.',       'From creature VFX to full colour grades — post-production quality that stands apart.', 4, true)
ON CONFLICT DO NOTHING;

-- ── 2. Portfolio Items (Work page — 18 items) ─────────────
INSERT INTO public.portfolio_items (title, slug, category, client_name, youtube_id, tags, featured, published, sort_order, homepage_featured)
VALUES
  -- Brand & Commercial
  ('A Steampunk Princess',                       'steampunk-princess',      'brand',   'Creative Direction',  'HAHj0TDQZcg', ARRAY['Cinematic','Drama'],          true,  true, 0,  true),
  ('Virus House Teaser',                         'virus-house-teaser',      'brand',   'Film Project',        'SgHHbWp64cE', ARRAY['Brand','Cinematic'],           false, true, 1,  false),
  ('Irving Scott Trailer',                       'irving-scott-trailer',    'brand',   'Irving Books',        'MHXXNX1LG7c', ARRAY['Brand','Trailer'],             false, true, 2,  false),
  -- AI Video
  ('Gen AI Video by Imba Production',            'gen-ai-video',            'ai',      'Imba Production',     '9k5w1iG_JHM', ARRAY['AI','Innovation'],             true,  true, 3,  true),
  ('Driving Through Futuristic City at Night',   'futuristic-city',         'ai',      'Creative Project',    '_eCIYm1_Hpo', ARRAY['AI','Generative'],             false, true, 4,  false),
  ('AI Corporate Video',                         'ai-corporate-video',      'ai',      'Tech Company',        'rzfWrv3ERxk', ARRAY['AI','Corporate'],              false, true, 5,  false),
  -- Cooking & Food
  ('Cooking Video Reel #1',                      'cooking-reel-1',          'cooking', 'Culinary Brand',      'SOt1I5u0yvE', ARRAY['Cooking','Reel'],              false, true, 6,  false),
  ('Cooking Video Reel #2',                      'cooking-reel-2',          'cooking', 'Culinary Brand',      'cBJoEGPMHoE', ARRAY['Cooking','Reel'],              false, true, 7,  false),
  ('Cooking Video Reel #3',                      'cooking-reel-3',          'cooking', 'Food Platform',       'EtBSTn9hKuY', ARRAY['Cooking','Reel'],              false, true, 8,  false),
  ('Basket of French Fries — Cooking Video',     'french-fries',            'cooking', 'Restaurant Brand',    'Ej4HgOORaZ4', ARRAY['Cooking','Food'],              false, true, 9,  false),
  ('Pumpkin Soup in a Wooden Bowl',              'pumpkin-soup',            'cooking', 'Culinary Brand',      'l9aUWFEVO_4', ARRAY['Cooking','Cinematic'],          false, true, 10, false),
  ('Delicious Sandwiches with Hummus',           'sandwiches-hummus',       'cooking', 'Food Creator',        'jBPNnr-j0c8', ARRAY['Cooking','Lifestyle'],         false, true, 11, false),
  -- Drone & Aerial
  ('Yoga on the Lake, Serbia',                   'yoga-lake-serbia',        'drone',   'Wellness Brand',      '_fbHbplDCwo', ARRAY['Drone','Lifestyle'],           true,  true, 12, true),
  ('Vietnam Top 5 Hotels',                       'vietnam-hotels',          'drone',   'Travel Publisher',    'BCtrr3I70sk', ARRAY['Drone','Travel'],              false, true, 13, false),
  ('Ovcar Banja Serbia — Real Estate 4K',        'ovcar-banja',             'drone',   'Prime Real Estate',   'PhjpiJ5jcBo', ARRAY['Drone','Real Estate'],         false, true, 14, false),
  -- Short & Social
  ('Natural Soap Social Media Ad',               'natural-soap-ad',         'social',  'Kozica Soaps',        'PHxMQ6FSiks', ARRAY['Social','Product'],            false, true, 15, false),
  ('Fine Droplets',                              'fine-droplets',           'social',  'Creative Project',    'LqPEeYQUaeQ', ARRAY['Social','Product'],            false, true, 16, false),
  -- Post Production
  ('The Creature Transformation',                'creature-transformation', 'post',    'Creative Project',    'EZUJiL9MeLw', ARRAY['VFX','Post Production'],       true,  true, 17, true)
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Testimonials ───────────────────────────────────────
INSERT INTO public.testimonials (client_name, client_role, client_company, text, rating, featured, published)
VALUES
  ('Predrag Kozica', NULL, 'Kozica Soaps',
   'Imba Productions exceeded our expectations with their professionalism and creativity. They crafted a stunning corporate video that perfectly encapsulated our company''s values and goals. The final product was incredibly polished, and we''ve received countless compliments from clients and partners. We highly recommend Imba Production to anyone seeking high-quality video production services!',
   5, true, true),
  ('Bojan Ilić', 'CEO', 'Massive Movie Horse',
   'Great cooperation with Ljubica and imba team. They provided us with great feedback and guided us through the entire process of creating our Videos. The end result is awesome and they continue to provide us with support whenever we need it. It was a pleasure working with Imba production, and Ljubica was very helpful throughout the whole development journey. Her expertise gave us confidence.',
   5, true, true),
  ('Dragan Dragovic', 'Developer & SEO Expert', 'Ogitive',
   'I loved working with imba production, initially, there was our help in equipping a full e-commerce shop. With full product images and product videos for advertising and website embedding. But SEO video embedding helped us to grow fast using video rich snippets.',
   5, false, true),
  ('Sarah Andersen', 'CMO', 'FoodCo International',
   'Imba transformed how we present our brand. The cooking series generated 3× more traffic than any previous content.',
   5, true, true),
  ('Marco Kessler', 'Growth Lead', 'NordShop',
   'The AI video campaign was something we had never seen. Personalisation at scale reduced our cost-per-acquisition by 40%.',
   5, false, true),
  ('Julia Larsson', 'Founder', 'Velour Boutique',
   'Professional, fast, genuinely creative. Full product video suite in 48 hours. The team is exceptional.',
   5, false, true)
ON CONFLICT DO NOTHING;

-- ── 4. Team Members ───────────────────────────────────────
INSERT INTO public.team_members (name, slug, role, bio, photo_url, social_links, sort_order, published)
VALUES
  ('Ljubica Jevremovic', 'ljubica-jevremovic', 'Partner & Creative Director',
   'A visionary video producer who has worked for leading Silicon Valley brands. The creative engine of Imba Production — she brings cinematic craft and bold storytelling to every project.',
   '/team/ljubica.jpg',
   '{"linkedin":"https://linkedin.com/in/ljubica-jevremovic","instagram":"https://instagram.com/imbaproduction"}'::jsonb,
   0, true),
  ('Marko Tiosavljevic', 'marko-tiosavljevic', 'Partner & Marketing Strategist',
   '20+ years in creative and digital marketing. Ensures every video is built around a clear business strategy — driving leads, sales, and brand equity for clients worldwide.',
   '/team/marko.jpg',
   '{"linkedin":"https://linkedin.com/in/marko-tiosavljevic","instagram":"https://instagram.com/imbaproduction"}'::jsonb,
   1, true)
ON CONFLICT (slug) DO NOTHING;

-- ── 5. Services (9 services with full detail) ─────────────
INSERT INTO public.services (name, slug, tagline, description, long_description, icon_key, features, sort_order, published)
VALUES
  ('Brand & Commercial Video', 'brand-video', 'Cinematic films that define your identity',
   'From brand story films and product launches to company culture videos and campaign spots — we produce broadcast-quality commercial content that elevates your brand across every channel.',
   'From brand story films and product launches to company culture videos and award-winning campaign spots — we produce broadcast-quality commercial content that elevates your brand across every channel. Our films don''t just look beautiful; they move audiences and drive measurable business results.',
   '▶',
   '[{"title":"Brand Story Films","desc":"Compelling founder stories, company culture films, and origin narratives that humanise your brand and build lasting emotional connection with your audience."},{"title":"Product Launch Videos","desc":"High-impact launch films that generate buzz, drive pre-orders, and position your product as a must-have from day one."},{"title":"TV & Online Commercials","desc":"Broadcast-quality commercial spots crafted for TV, YouTube pre-roll, and programmatic display."},{"title":"Corporate Culture & Profiles","desc":"Authentic behind-the-scenes content that attracts top talent, builds investor trust, and differentiates your brand."},{"title":"Event & Campaign Coverage","desc":"Full-crew event capture with same-day turnaround capability."},{"title":"Documentary-Style Brand Films","desc":"Long-form cinematic storytelling for brands with a deeper story to tell."}]'::jsonb,
   0, true),

  ('AI-Powered Video', 'ai-video', 'Human creativity, machine speed',
   'AI-driven editing, scriptwriting, personalisation at scale, and generative B-roll. We leverage Runway, Sora, and Stable Diffusion to create campaigns that were previously impossible.',
   'We leverage Runway, Sora, Stable Diffusion, and proprietary AI workflows to create video campaigns that were previously impossible — or prohibitively expensive. AI doesn''t replace our creative team; it amplifies what they can achieve.',
   '◈',
   '[{"title":"AI-Driven Editing & Post-Production","desc":"Automated rough cuts, scene selection, and AI-powered colour grading that deliver broadcast-quality results in a fraction of the time."},{"title":"Script & Storyboard Generation","desc":"We use large language models to rapidly generate, iterate, and stress-test scripts and creative concepts."},{"title":"Personalised Video at Scale","desc":"Create hundreds of personalised video variants from a single master — customised by name, company, product, or offer."},{"title":"AI Avatar Production","desc":"Photorealistic AI presenters and brand spokespersons that speak in dozens of languages."},{"title":"Generative B-Roll & Visual FX","desc":"Stunning generative imagery and AI-created B-roll sequences that fill production gaps."},{"title":"AI-Powered Campaign Analysis","desc":"AI-driven performance analysis on your existing video content to identify what''s working."}]'::jsonb,
   1, true),

  ('Product & Ecommerce Video', 'product-video', 'Videos that convert browsers into buyers',
   'Product demos, unboxing, recipe videos, and ecommerce spots — conversion-focused content built to stop the scroll and drive purchases.',
   'Product videos are the single highest-ROI content investment for ecommerce brands. We produce conversion-focused product content built to stop the scroll, communicate value instantly, and drive purchases on Amazon, Shopify, and across social platforms.',
   '▣',
   '[{"title":"Product Demonstration Videos","desc":"Clear, compelling demos that show exactly how your product works and solves a problem."},{"title":"Amazon & Marketplace Listing Videos","desc":"Optimised for Amazon A+ content, Etsy, and other marketplaces."},{"title":"eCommerce Ad Spots","desc":"Short, punchy paid social ads designed for Meta, TikTok, and YouTube."},{"title":"Unboxing & Reveal Videos","desc":"Premium unboxing content that drives social sharing and influencer seeding."},{"title":"Shopify & DTC Brand Videos","desc":"Homepage hero videos, collection page features, and full-funnel video content."},{"title":"Customer Testimonial Integration","desc":"Real customers, professionally filmed — woven into your product pages for maximum social proof."}]'::jsonb,
   2, true),

  ('Short & Social Video', 'social-video', 'Native to every algorithm',
   'TikTok, Reels, Shorts — natively-crafted vertical content with special effects, trending sounds, and storytelling built for maximum organic reach.',
   'TikTok, Instagram Reels, and YouTube Shorts aren''t just platforms — they''re entire economies. We produce natively-crafted short-form content with the storytelling, pacing, and visual language that algorithms reward and audiences love.',
   '◉',
   '[{"title":"TikTok Brand & Product Videos","desc":"Native-feeling TikTok content with trending formats, authentic energy, and strategic hooks in the first 2 seconds."},{"title":"Instagram Reels & Stories","desc":"Visually stunning Reels optimised for the Instagram algorithm."},{"title":"YouTube Shorts","desc":"Short-form YouTube content that converts subscribers and feeds your long-form funnel."},{"title":"Promotional Teasers & Ad Spots","desc":"6–30 second paid social spots built for Meta, TikTok, and YouTube Ads."},{"title":"Trending Sound & Format Integration","desc":"We monitor platform trends in real time and integrate proven formats into your branded content."},{"title":"Content Series Production","desc":"Monthly or weekly content series delivered on a production retainer."}]'::jsonb,
   3, true),

  ('Cooking & Food Video', 'cooking-video', 'Culinary cinematography that sells',
   'Specialist cooking video producers — blending technical expertise with culinary passion. From recipe tutorials to high-end restaurant promos.',
   'Food video is one of the most powerful content formats on earth — and the most technically demanding to get right. We are specialist food and cooking video producers, blending technical filmmaking expertise with genuine culinary passion.',
   '◎',
   '[{"title":"Recipe & Tutorial Videos","desc":"Step-by-step cooking videos from quick social clips to long-form YouTube tutorials."},{"title":"Restaurant & Brand Promo Films","desc":"Atmospheric restaurant films and brand campaigns that capture the essence of your food, space, and story."},{"title":"Social Media Food Content","desc":"Viral-format cooking content natively built for TikTok, Instagram Reels, and YouTube Shorts."},{"title":"eCommerce Food Product Videos","desc":"Conversion-focused videos for food brands selling on Amazon, Shopify, or direct."},{"title":"Food Styling & Preparation","desc":"We handle all food styling, preparation, and ingredient sourcing for our shoots."},{"title":"Culinary Brand Identity Films","desc":"Long-form brand films for restaurants, food brands, and culinary entrepreneurs."}]'::jsonb,
   4, true),

  ('Post Production', 'post-production', 'Where raw footage becomes a masterpiece',
   'Full-service editing, colour grading, motion graphics, sound design, and VFX from our in-house studio.',
   'You shoot it — we transform it. Our in-house post-production studio provides full-service editing, colour grading, motion graphics, sound design, and VFX for clients worldwide. We work with footage shot by any team, on any camera, in any format.',
   '◫',
   '[{"title":"Advanced Editing & Assembly","desc":"From rough assembly to precision multi-track editing — every cut is intentional."},{"title":"Expert Colour Grading & HDR","desc":"Professional colour grading in DaVinci Resolve — from natural correction to bold cinematic looks."},{"title":"Motion Graphics & 3D Animation","desc":"Logo animations, lower thirds, kinetic typography, infographic sequences, and full 3D motion work."},{"title":"Sound Design & Music Licensing","desc":"Full sound design, dialogue cleanup, ambient soundscapes, and Foley."},{"title":"VFX & Compositing","desc":"Green screen compositing, object removal, sky replacement, creature effects, and practical-effect enhancement."},{"title":"Platform-Optimised Export & Delivery","desc":"Every deliverable exported to exact platform specs."}]'::jsonb,
   5, true),

  ('eLearning & Corporate Training', 'elearning-video', 'Education that actually engages',
   'Professional eLearning and corporate training video production for MOOCs, LMS platforms, and internal training.',
   'Text-based training has an average retention rate of 10%. Video-based learning achieves 95%. We produce professional eLearning and corporate training video content for MOOCs, LMS platforms, and internal training programmes.',
   '◰',
   '[{"title":"Lecture & Tutorial Videos","desc":"Professional presenter-to-camera content with studio lighting, broadcast audio, and teleprompter support."},{"title":"Screen-Recorded Walkthroughs","desc":"Software demos, process walkthroughs, and technical tutorials with professional screen capture."},{"title":"Animated Explainers & Infographics","desc":"Complex concepts made clear through 2D and 3D animation, kinetic typography, and infographic sequences."},{"title":"Corporate Onboarding & Compliance","desc":"Onboarding programmes, HR policy training, compliance modules, and safety briefings."},{"title":"SCORM-Ready LMS Integration","desc":"All content delivered SCORM 1.2 and 2004 compliant, with xAPI support."},{"title":"Interactive Video Modules","desc":"Branching scenarios, knowledge check overlays, clickable hotspots, and interactive decision trees."}]'::jsonb,
   6, true),

  ('Fashion & Lifestyle Video', 'fashion-video', 'Style that moves',
   'Fashion videos for brands, designers, and influencers with cinematic framing and intentional styling.',
   'Fashion is the most visual industry in the world — and video is the medium that does it justice. We produce fashion films, lookbooks, and lifestyle content for brands, designers, and creative directors who refuse to compromise on quality.',
   '◇',
   '[{"title":"Lookbook & Collection Films","desc":"Cinematic seasonal lookbooks and collection launch films."},{"title":"Product Demonstration & Detail Shots","desc":"Close-up product films that showcase fabric, texture, movement, and construction."},{"title":"Social Media Fashion Content","desc":"Platform-native fashion content for TikTok, Instagram Reels, and Pinterest."},{"title":"Brand Story & Campaign Videos","desc":"Full-length brand films that communicate your aesthetic, values, and vision."},{"title":"Model Direction & Casting","desc":"We handle model casting, wardrobe direction, and on-set styling."},{"title":"International & Location Production","desc":"We produce fashion content globally — bringing a full crew to your location."}]'::jsonb,
   7, true),

  ('Testimonial & Case Study Video', 'testimonial-video', 'Social proof that converts',
   'Authentic testimonial videos and case studies that build trust and drive conversions.',
   'Ninety-two percent of buyers trust peer recommendations over brand advertising. We produce authentic, professionally filmed testimonial and case study videos that build credibility, handle objections, and turn hesitant prospects into confident buyers.',
   '◐',
   '[{"title":"Customer Testimonial Films","desc":"Authentic, professionally filmed testimonials that capture real customer emotion and specific, credible results."},{"title":"Case Study Videos","desc":"Full before-and-after case study films showing the problem, the solution, and the measurable results."},{"title":"Short-Form Social Testimonials","desc":"Testimonial snippets cut for TikTok, Instagram, and LinkedIn."},{"title":"Pre-Interview Prep & Scripting","desc":"Full pre-interview preparation with your customers."},{"title":"Remote & Hybrid Filming Options","desc":"Professional testimonials using directed self-filming kits or partnered local crews worldwide."},{"title":"Strategic Placement & Distribution","desc":"We advise on where and how to deploy your testimonial content across the funnel."}]'::jsonb,
   8, true)
ON CONFLICT (slug) DO NOTHING;

-- ── 6. Blog Categories ────────────────────────────────────
INSERT INTO public.blog_categories (name, slug)
VALUES
  ('AI Video',          'ai-video'),
  ('Video Production',  'video-production'),
  ('TikTok',            'tiktok'),
  ('Film',              'film'),
  ('Technology',        'technology')
ON CONFLICT (slug) DO NOTHING;

-- ── 7. Blog Posts (12 articles) ───────────────────────────
INSERT INTO public.blog_posts (title, slug, excerpt, category, read_time_minutes, published, published_at)
VALUES
  ('How to Explode Your Sales Using AI Video: The Ultimate Guide for 2026',
   'ai-video-sales-guide-2026',
   'AI video outreach gets 2–3× more response rates than plain text. Discover the exact workflow we use to produce AI-powered video campaigns that convert.',
   'AI Video', 9, true, '2026-03-08'::timestamptz),

  ('How to Generate Sales with Video Products: A Comprehensive Guide',
   'generate-sales-video-products',
   'Product videos increase conversions by up to 80%. This guide covers every type of product video — from demos to testimonials — and when to use each.',
   'Video Production', 8, true, '2025-03-30'::timestamptz),

  ('The Impact of AI on Video Production in 2025',
   'ai-impact-video-production-2025',
   'From automated editing and AI avatars to generative B-roll — how AI is fundamentally changing what''s possible in video production, and how to stay ahead.',
   'AI Video', 7, true, '2025-01-13'::timestamptz),

  ('Going Viral: Strategies for eCommerce Brands on TikTok',
   'tiktok-ecommerce-viral-strategies',
   'TikTok drives billions in ecommerce sales. Learn the content formats, posting cadences, and production techniques that actually lead to viral product videos.',
   'TikTok', 6, true, '2024-12-25'::timestamptz),

  ('How to Generate Website Traffic with Video SEO in 2025',
   'video-seo-traffic-2025',
   'YouTube is the world''s second-largest search engine. A practical guide to optimising your video content for discovery, featuring our exact keyword strategy.',
   'Video Production', 7, true, '2024-10-28'::timestamptz),

  ('Transforming Views into Sales: The Power of Shoppable Video',
   'shoppable-video-sales',
   'Shoppable video bridges the gap between content and commerce. A complete breakdown of the technology, platforms, and creative approach that converts viewers into buyers.',
   'AI Video', 5, true, '2024-09-22'::timestamptz),

  ('TikTok Success: A Step-by-Step Guide to Shooting Engaging Brand Videos',
   'tiktok-brand-video-guide',
   'Production tips, creative formats, and the exact shooting checklist we use to produce TikTok content that consistently outperforms clients'' existing organic reach.',
   'TikTok', 6, true, '2024-09-21'::timestamptz),

  ('Why User-Generated Content is Revolutionizing Digital Marketing',
   'ugc-digital-marketing',
   'UGC converts at 4× the rate of brand-produced content. Here''s how to brief, direct, and edit UGC-style videos that feel authentic and drive real results.',
   'Video Production', 5, true, '2024-09-20'::timestamptz),

  ('Unleash Creativity: Master Micro Drama in Video Production',
   'micro-drama-video-production',
   'Micro-dramas are exploding on every platform. A deep dive into the format, storytelling structure, and production workflow that makes these short films so addictive.',
   'Film', 6, true, '2024-10-27'::timestamptz),

  ('Exploring the Latest Advances in 4K and 8K Video Technology',
   '4k-8k-video-technology',
   'How the latest camera technology is changing what''s possible in commercial production — and how we use it to deliver broadcast-quality footage for brand campaigns.',
   'Technology', 6, true, '2025-02-24'::timestamptz),

  ('The Rise of AI in Video Production: A 2024 Perspective',
   'ai-video-production-2024',
   'A comprehensive look at how AI tools — Runway, Sora, Stable Diffusion — are reshaping production pipelines and what it means for brands and agencies.',
   'AI Video', 8, true, '2025-01-13'::timestamptz),

  ('Unleashing Future Visions: Generative AI Video 2025',
   'generative-ai-video-2025',
   'Generative AI video has crossed the uncanny valley. How we''re integrating tools like Sora into real client productions — and the results we''re seeing.',
   'AI Video', 7, true, '2024-10-12'::timestamptz)
ON CONFLICT (slug) DO NOTHING;

-- ── 8. Site Settings (social links, contact, company stats) ─
INSERT INTO public.site_settings (key, value)
VALUES
  ('social_links', '[
    {"label":"Instagram","short":"IG","href":"https://instagram.com/imbaproduction"},
    {"label":"YouTube","short":"YT","href":"https://youtube.com/channel/UCV4zBHquBoo4NLw0tMi2ZKQ"},
    {"label":"TikTok","short":"TK","href":"https://tiktok.com/@imbaproduction"},
    {"label":"LinkedIn","short":"LI","href":"https://linkedin.com/company/imba-production"},
    {"label":"X / Twitter","short":"X","href":"https://twitter.com/productionimba"},
    {"label":"Fiverr","short":"FV","href":"https://fiverr.com/imbaproduction"}
  ]'::jsonb),
  ('company_stats', '[
    {"num":"12","sup":"+","label":"Years"},
    {"num":"500","sup":"+","label":"Videos"},
    {"num":"48","sup":"h","label":"Turnaround"},
    {"num":"98","sup":"%","label":"Satisfaction"}
  ]'::jsonb),
  ('clients', '["FoodCo International","NordShop","Velour Boutique","Irving Books","Kozica Soaps","Ogitive","Massive Movie Horse","Prime Real Estate"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

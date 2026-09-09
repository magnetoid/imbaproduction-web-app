-- ═══════════════════════════════════════════════════════════
--  V015: Drop dead YouTube IDs, seed live channel work
--  Channel: UCV4zBHquBoo4NLw0tMi2ZKQ (Imba Production)
--  Dead (404): HAHj0TDQZcg, _eCIYm1_Hpo, rzfWrv3ERxk
-- ═══════════════════════════════════════════════════════════

DELETE FROM public.hero_videos
WHERE youtube_id IN ('HAHj0TDQZcg', '_eCIYm1_Hpo', 'rzfWrv3ERxk');

DELETE FROM public.portfolio_items
WHERE youtube_id IN ('HAHj0TDQZcg', '_eCIYm1_Hpo', 'rzfWrv3ERxk');

-- Hero table has no unique on youtube_id; replace the reel so re-runs stay idempotent.
DELETE FROM public.hero_videos;

INSERT INTO public.hero_videos (
  youtube_id, title, slide_eyebrow, slide_headline, slide_headline_em, slide_subheadline, sort_order, active
) VALUES
  ('WqC_sML9a8A', 'Cinematic Spa Promo',
   'Brand & Commercial',
   'Stories that define', 'your brand.',
   'Cinematic brand films that captivate audiences and drive measurable business results.',
   0, true),
  ('9k5w1iG_JHM', 'Gen AI Video',
   'AI Video Production',
   'Human creativity,', 'machine speed.',
   'AI-powered campaigns that scale your creative output without sacrificing quality.',
   1, true),
  ('EZUJiL9MeLw', 'The Creature Transformation',
   'Post Production & VFX',
   'Every frame crafted', 'with intention.',
   'From creature VFX to full colour grades — post-production quality that stands apart.',
   2, true),
  ('_YnUju357Bg', 'Cooking Showreel',
   'Cooking & Food',
   'Food video that', 'makes people hungry.',
   'Styling, lighting, and edit in-house — cinematic cooking films for brands and creators.',
   3, true),
  ('Kud0bPYAobM', 'Perfume Ad',
   'Product & Social',
   'Make the scroll stop.', 'Make the checkout work.',
   'Vertical-native product and social video engineered for Meta, TikTok and Amazon.',
   4, true);

INSERT INTO public.portfolio_items (
  title, slug, category, client_name, youtube_id, tags, featured, published, sort_order, homepage_featured
) VALUES
  -- Brand
  ('Cinematic Spa Promo',                    'cinematic-spa-promo',        'brand',   'Wellness Brand',      'WqC_sML9a8A', ARRAY['Brand','Cinematic'],           true,  true, 0,  true),
  ('Virus House Teaser',                     'virus-house-teaser',         'brand',   'Film Project',        'SgHHbWp64cE', ARRAY['Brand','Cinematic'],           false, true, 1,  false),
  ('Irving Scott Trailer',                   'irving-scott-trailer',       'brand',   'Irving Books',        'MHXXNX1LG7c', ARRAY['Brand','Trailer'],             false, true, 2,  false),
  ('Perfume Ad',                             'perfume-ad',                 'brand',   'Fragrance Brand',     'Kud0bPYAobM', ARRAY['Brand','Product'],             true,  true, 3,  true),
  -- AI
  ('Gen AI Video by Imba Production',        'gen-ai-video',               'ai',      'Imba Production',     '9k5w1iG_JHM', ARRAY['AI','Innovation'],             true,  true, 4,  true),
  ('Raspberry Yoghurt Cups (AI Cooking)',    'raspberry-yoghurt-cups',     'ai',      'Food Brand',          'sV1Fop4kJVM', ARRAY['AI','Cooking'],                false, true, 5,  false),
  -- Cooking
  ('Cooking Showreel',                       'cooking-showreel',           'cooking', 'Imba Production',     '_YnUju357Bg', ARRAY['Cooking','Reel'],              true,  true, 6,  true),
  ('Focaccia Sandwich',                      'focaccia-sandwich',          'cooking', 'Culinary Brand',      'GY3h4UO1Ck0', ARRAY['Cooking','Food'],              false, true, 7,  false),
  ('Cooking Man — Slow Motion',              'cooking-man-slow-motion',    'cooking', 'Culinary Brand',      '_64Cu5FxNv8', ARRAY['Cooking','Cinematic'],         false, true, 8,  false),
  ('Cooking Video Reel #1',                  'cooking-reel-1',             'cooking', 'Culinary Brand',      'SOt1I5u0yvE', ARRAY['Cooking','Reel'],              false, true, 9,  false),
  ('Cooking Video Reel #2',                  'cooking-reel-2',             'cooking', 'Culinary Brand',      'cBJoEGPMHoE', ARRAY['Cooking','Reel'],              false, true, 10, false),
  ('Cooking Video Reel #3',                  'cooking-reel-3',             'cooking', 'Food Platform',       'EtBSTn9hKuY', ARRAY['Cooking','Reel'],              false, true, 11, false),
  ('Basket of French Fries',                 'french-fries',               'cooking', 'Restaurant Brand',    'Ej4HgOORaZ4', ARRAY['Cooking','Food'],              false, true, 12, false),
  ('Pumpkin Soup in a Wooden Bowl',          'pumpkin-soup',               'cooking', 'Culinary Brand',      'l9aUWFEVO_4', ARRAY['Cooking','Cinematic'],         false, true, 13, false),
  ('Sandwiches with Hummus',                 'sandwiches-hummus',          'cooking', 'Food Creator',        'jBPNnr-j0c8', ARRAY['Cooking','Lifestyle'],         false, true, 14, false),
  ('Short Food Social Ad',                   'short-food-social-ad',       'cooking', 'Food Brand',          'NIo6n4XdBTg', ARRAY['Cooking','Social'],            false, true, 15, false),
  -- Drone
  ('Yoga on the Lake, Serbia',               'yoga-lake-serbia',           'drone',   'Wellness Brand',      '_fbHbplDCwo', ARRAY['Drone','Lifestyle'],           true,  true, 16, true),
  ('Vietnam Top 5 Hotels',                   'vietnam-hotels',             'drone',   'Travel Publisher',    'BCtrr3I70sk', ARRAY['Drone','Travel'],              false, true, 17, false),
  ('Ovčar Banja — Real Estate 4K',           'ovcar-banja',                'drone',   'Prime Real Estate',   'PhjpiJ5jcBo', ARRAY['Drone','Real Estate'],         false, true, 18, false),
  ('Fall at the Hippodrome, Kragujevac',     'fall-hippodrome',            'drone',   'Travel Film',         'QQVzFOVbN_I', ARRAY['Drone','Travel'],              false, true, 19, false),
  -- Social / product
  ('Natural Soap Social Media Ad',           'natural-soap-ad',            'social',  'Kozica Soaps',        'PHxMQ6FSiks', ARRAY['Social','Product'],            false, true, 20, false),
  ('Fine Droplets',                          'fine-droplets',              'social',  'Creative Project',    'LqPEeYQUaeQ', ARRAY['Social','Product'],            false, true, 21, false),
  ('Replay Product Video',                   'replay-product-video',       'social',  'Replay',              'WfvbdNlrsbc', ARRAY['Social','Product'],            false, true, 22, false),
  ('Starbucks Stop-Motion Ad',               'starbucks-stop-motion',      'social',  'Starbucks',           'HOVuTC5UEJ0', ARRAY['Social','Product'],            false, true, 23, false),
  ('Starbucks Coffee Ad',                    'starbucks-coffee-ad',        'social',  'Starbucks',           'lfGkw0j3QA8', ARRAY['Social','Product'],            false, true, 24, false),
  -- Post
  ('The Creature Transformation',            'creature-transformation',    'post',    'Creative Project',    'EZUJiL9MeLw', ARRAY['VFX','Post Production'],       true,  true, 25, true)
ON CONFLICT (slug) DO UPDATE SET
  title              = EXCLUDED.title,
  category           = EXCLUDED.category,
  client_name        = EXCLUDED.client_name,
  youtube_id         = EXCLUDED.youtube_id,
  tags               = EXCLUDED.tags,
  featured           = EXCLUDED.featured,
  published          = true,
  sort_order         = EXCLUDED.sort_order,
  homepage_featured  = EXCLUDED.homepage_featured,
  updated_at         = NOW();

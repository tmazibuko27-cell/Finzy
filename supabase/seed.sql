-- SYNTHETIC DEMO SEED — mirrors lib/mockFeed.ts / lib/mockEntities.ts so the
-- live feed looks identical to the local demo once Supabase is connected.
-- Replace with real, source-reviewed editorial content before launch; see
-- the "Launch content target" section of the product spec (250-400 cards).
-- Run with: supabase db reset   (applies migrations then this file)
--       or: psql "$DATABASE_URL" -f supabase/seed.sql

begin;

-- ============================================================
-- TOPICS (onboarding interest categories + pillars referenced by mock cards)
-- ============================================================
insert into topics (slug, name, category) values
  ('ceos', 'CEOs', 'People'),
  ('billionaires', 'Billionaires', 'People'),
  ('company-stories', 'Company Stories', 'Companies'),
  ('stocks', 'Stocks', 'Markets'),
  ('investing', 'Investing', 'Learn'),
  ('economics', 'Economics', 'Learn'),
  ('financial-history', 'Financial History', 'History'),
  ('accounting', 'Accounting', 'Learn'),
  ('personal-finance', 'Personal Finance', 'Learn'),
  ('careers', 'Careers', 'Learn'),
  ('bonds', 'Bonds', 'Markets'),
  ('etfs', 'ETFs', 'Markets'),
  ('market-crashes', 'Market Crashes', 'History')
on conflict (slug) do nothing;

-- ============================================================
-- PEOPLE
-- ============================================================
insert into people (slug, name, bio_short, roles, status, rarity) values
  ('steve-jobs', 'Steve Jobs', 'Co-founder and former CEO of Apple', array['founder','CEO'], 'published', 'legendary'),
  ('warren-buffett', 'Warren Buffett', 'Chairman and CEO of Berkshire Hathaway', array['investor','CEO'], 'published', 'legendary'),
  ('benjamin-graham', 'Benjamin Graham', 'Economist known as the father of value investing', array['economist','investor'], 'published', 'rare'),
  ('jensen-huang', 'Jensen Huang', 'Co-founder and CEO of NVIDIA', array['founder','CEO'], 'published', 'epic'),
  ('satya-nadella', 'Satya Nadella', 'Chairman and CEO of Microsoft', array['CEO'], 'published', 'common'),
  ('jamie-dimon', 'Jamie Dimon', 'Chairman and CEO of JPMorgan Chase', array['CEO'], 'published', 'common'),
  -- Global roster (docs/global-roster-research.json) — draft, not editorially reviewed
  ('gina-rinehart', 'Gina Rinehart', 'CEO — Hancock Prospecting', array['CEO'], 'published', 'epic'),
  ('graeme-hart', 'Graeme Hart', 'Investor — Rank Group', array['investor'], 'published', 'rare'),
  ('marcos-galperin', 'Marcos Galperin', 'Founder — MercadoLibre', array['founder'], 'published', 'epic'),
  ('marcelo-claure', 'Marcelo Claure', 'Founder — Bicycle Capital', array['founder'], 'published', 'rare'),
  ('jorge-paulo-lemann', 'Jorge Paulo Lemann', 'Founder — 3G Capital', array['founder'], 'published', 'epic'),
  ('iris-fontbona', 'Iris Fontbona', 'Investor — Antofagasta plc / Grupo Luksic', array['investor'], 'published', 'rare'),
  ('luis-carlos-sarmiento', 'Luis Carlos Sarmiento', 'Founder — Grupo Aval', array['founder'], 'published', 'rare'),
  ('isabel-noboa', 'Isabel Noboa', 'Founder — Nobis Consortium', array['founder'], 'published', 'rare'),
  ('yesu-persaud', 'Yesu Persaud', 'Founder — Demerara Distillers Limited', array['founder'], 'published', 'rare'),
  ('horacio-cartes', 'Horacio Cartes', 'Founder — Tabacalera del Este (Grupo Cartes)', array['founder'], 'published', 'rare'),
  ('carlos-rodriguez-pastor', 'Carlos Rodriguez-Pastor', 'CEO — Intercorp', array['CEO'], 'published', 'rare'),
  ('dilip-sardjoe', 'Dilip Sardjoe', 'Founder — Rudisa Group', array['founder'], 'published', 'rare'),
  ('sergio-fogel', 'Sergio Fogel', 'Founder — dLocal', array['founder'], 'published', 'rare'),
  ('lorenzo-mendoza', 'Lorenzo Mendoza', 'CEO — Empresas Polar', array['CEO'], 'published', 'rare'),
  ('ruben-vardanyan', 'Ruben Vardanyan', 'Founder — Troika Dialog', array['founder'], 'published', 'rare'),
  ('vagit-alekperov', 'Vagit Alekperov', 'CEO — LUKOIL', array['CEO'], 'published', 'common'),
  ('nemir-kirdar', 'Nemir Kirdar', 'Founder — Investcorp', array['founder'], 'published', 'rare'),
  ('muhammad-yunus', 'Muhammad Yunus', 'Founder — Grameen Bank', array['founder'], 'published', 'rare'),
  ('kith-meng', 'Kith Meng', 'Founder — Royal Group', array['founder'], 'published', 'rare'),
  ('jack-ma', 'Jack Ma', 'Founder — Alibaba Group', array['founder'], 'published', 'legendary'),
  ('stelios-haji-ioannou', 'Stelios Haji-Ioannou', 'Founder — easyGroup / easyJet', array['founder'], 'published', 'rare'),
  ('bidzina-ivanishvili', 'Bidzina Ivanishvili', 'Founder — Rossiysky Kredit / Cartu Group', array['founder'], 'published', 'rare'),
  ('mukesh-ambani', 'Mukesh Ambani', 'CEO — Reliance Industries', array['CEO'], 'published', 'legendary'),
  ('prajogo-pangestu', 'Prajogo Pangestu', 'Founder — Barito Pacific Group', array['founder'], 'published', 'epic'),
  ('nadhmi-auchi', 'Nadhmi Auchi', 'Founder — General Mediterranean Holding', array['founder'], 'published', 'rare'),
  ('gil-shwed', 'Gil Shwed', 'Founder — Check Point Software Technologies', array['founder'], 'published', 'rare'),
  ('tadashi-yanai', 'Tadashi Yanai', 'Founder — Fast Retailing (Uniqlo)', array['founder'], 'published', 'legendary'),
  ('amjad-masad', 'Amjad Masad', 'Founder — Replit', array['founder'], 'published', 'rare'),
  ('vyacheslav-kim', 'Vyacheslav Kim', 'Founder — Kaspi.kz', array['founder'], 'published', 'rare'),
  ('nasser-al-kharafi', 'Nasser Al-Kharafi', 'CEO — M.A. Kharafi & Sons', array['CEO'], 'published', 'rare'),
  ('najib-mikati', 'Najib Mikati', 'Founder — M1 Group / Investcom', array['founder'], 'published', 'rare'),
  ('robert-kuok', 'Robert Kuok', 'Founder — Kuok Group', array['founder'], 'published', 'rare'),
  ('qasim-ibrahim', 'Qasim Ibrahim', 'Founder — Villa Group', array['founder'], 'published', 'rare'),
  ('odjargal-jambaljamts', 'Odjargal Jambaljamts', 'Founder — Mongolian Mining Corporation (MCS Group)', array['founder'], 'published', 'rare'),
  ('serge-pun', 'Serge Pun', 'Founder — Yoma Strategic Holdings', array['founder'], 'published', 'rare'),
  ('binod-chaudhary', 'Binod Chaudhary', 'Founder — Chaudhary Group (CG Corp Global)', array['founder'], 'published', 'rare'),
  ('sheikh-suhail-bahwan', 'Sheikh Suhail Bahwan', 'Founder — Suhail Bahwan Group', array['founder'], 'published', 'rare'),
  ('mian-muhammad-mansha', 'Mian Muhammad Mansha', 'Founder — Nishat Group / MCB Bank', array['founder'], 'published', 'rare'),
  ('munib-al-masri', 'Munib al-Masri', 'Founder — Palestine Development and Investment Company (PADICO)', array['founder'], 'published', 'rare'),
  ('enrique-razon-jr', 'Enrique Razon Jr.', 'CEO — International Container Terminal Services (ICTSI)', array['CEO'], 'published', 'rare'),
  ('sheikh-hamad-bin-jassim-bin-jaber-al-thani', 'Sheikh Hamad bin Jassim bin Jaber Al Thani', 'Investor — Al Mirqab Capital', array['investor'], 'published', 'rare'),
  ('prince-alwaleed-bin-talal', 'Prince Alwaleed bin Talal', 'Founder — Kingdom Holding Company', array['founder'], 'published', 'epic'),
  ('forrest-li', 'Forrest Li', 'CEO — Sea Limited', array['CEO'], 'published', 'rare'),
  ('lee-jae-yong', 'Lee Jae-yong', 'CEO — Samsung Electronics', array['CEO'], 'published', 'epic'),
  ('dhammika-perera', 'Dhammika Perera', 'Founder — Vallibel One / Hayleys', array['founder'], 'published', 'rare'),
  ('rami-makhlouf', 'Rami Makhlouf', 'Founder — Syriatel', array['founder'], 'published', 'rare'),
  ('dhanin-chearavanont', 'Dhanin Chearavanont', 'CEO — Charoen Pokphand (CP) Group', array['CEO'], 'published', 'rare'),
  ('murat-ulker', 'Murat Ulker', 'CEO — Yildiz Holding', array['CEO'], 'published', 'epic'),
  ('sultan-ahmed-bin-sulayem', 'Sultan Ahmed bin Sulayem', 'CEO — DP World', array['CEO'], 'published', 'rare'),
  ('alisher-usmanov', 'Alisher Usmanov', 'Founder — USM Holdings', array['founder'], 'published', 'common'),
  ('pham-nhat-vuong', 'Pham Nhat Vuong', 'Founder — Vingroup', array['founder'], 'published', 'rare'),
  ('hayel-saeed-anam', 'Hayel Saeed Anam', 'Founder — Hayel Saeed Anam Group (HSA Group)', array['founder'], 'published', 'rare'),
  ('benoni-urey', 'Benoni Urey', 'Founder — Lonestar Communications Corporation', array['founder'], 'published', 'rare'),
  ('hesham-husni-bey', 'Hesham Husni Bey', 'CEO — HB Group', array['CEO'], 'published', 'rare'),
  ('ylias-akbaraly', 'Ylias Akbaraly', 'Founder — Sipromad Group (Redland)', array['founder'], 'published', 'rare'),
  ('thom-mpinganjira', 'Thom Mpinganjira', 'Founder — FDH Bank', array['founder'], 'published', 'rare'),
  ('mamadou-sinsy-coulibaly', 'Mamadou Sinsy Coulibaly', 'Founder — Kledu Group', array['founder'], 'published', 'rare'),
  ('mohamed-ould-bouamatou', 'Mohamed Ould Bouamatou', 'Founder — BSA Group', array['founder'], 'published', 'rare'),
  ('arnaud-lagesse', 'Arnaud Lagesse', 'CEO — IBL Ltd', array['CEO'], 'published', 'rare'),
  ('othman-benjelloun', 'Othman Benjelloun', 'CEO — Bank of Africa (formerly BMCE Bank)', array['CEO'], 'published', 'rare'),
  ('salimo-abdula', 'Salimo Abdula', 'Founder — Intelec Holdings Group', array['founder'], 'published', 'rare'),
  ('sven-thieme', 'Sven Thieme', 'Investor — Ohlthaver & List Group', array['investor'], 'published', 'rare'),
  ('aliko-dangote', 'Aliko Dangote', 'Founder — Dangote Group', array['founder'], 'published', 'legendary'),
  ('tribert-rujugiro-ayabatwa', 'Tribert Rujugiro Ayabatwa', 'Founder — Pan African Tobacco Group', array['founder'], 'published', 'rare'),
  ('yerim-sow', 'Yerim Sow', 'Founder — Teyliom Group', array['founder'], 'published', 'rare'),
  ('mukesh-valabhji', 'Mukesh Valabhji', 'Investor — Capital Management Group', array['investor'], 'published', 'rare'),
  ('hisham-mackie', 'Hisham Mackie', 'Founder — H.M Diamond', array['founder'], 'published', 'rare'),
  ('abdirashid-duale', 'Abdirashid Duale', 'CEO — Dahabshiil', array['CEO'], 'published', 'rare'),
  ('johann-rupert', 'Johann Rupert', 'Investor — Compagnie Financiere Richemont', array['investor'], 'published', 'epic'),
  ('mo-ibrahim', 'Mo Ibrahim', 'Founder — Celtel', array['founder'], 'published', 'rare'),
  ('mohammed-dewji', 'Mohammed Dewji', 'CEO — MeTL Group', array['CEO'], 'published', 'rare'),
  ('gervais-djondo', 'Gervais Djondo', 'Founder — Ecobank / ASKY Airlines', array['founder'], 'published', 'rare'),
  ('marouan-mabrouk', 'Marouan Mabrouk', 'Investor — Groupe Mabrouk', array['investor'], 'published', 'rare'),
  ('sudhir-ruparelia', 'Sudhir Ruparelia', 'Founder — Ruparelia Group', array['founder'], 'published', 'rare'),
  ('hakainde-hichilema', 'Hakainde Hichilema', 'Investor — Grant Thornton Zambia', array['investor'], 'published', 'common'),
  ('strive-masiyiwa', 'Strive Masiyiwa', 'Founder — Econet Wireless', array['founder'], 'published', 'rare'),
  ('issad-rebrab', 'Issad Rebrab', 'Founder — Cevital', array['founder'], 'published', 'rare'),
  ('isabel-dos-santos', 'Isabel dos Santos', 'Founder — Unitel', array['founder'], 'published', 'rare'),
  ('sebastien-ajavon', 'Sebastien Ajavon', 'Founder — Cajaf-Comon', array['founder'], 'published', 'rare'),
  ('ramachandran-ottapathu', 'Ramachandran Ottapathu', 'CEO — Choppies Enterprises', array['CEO'], 'published', 'rare'),
  ('mahamadou-bonkoungou', 'Mahamadou Bonkoungou', 'Founder — EBOMAF', array['founder'], 'published', 'rare'),
  ('adrien-ntigacika', 'Adrien Ntigacika', 'Founder — ITRACOM Holding', array['founder'], 'published', 'rare'),
  ('baba-ahmadou-danpullo', 'Baba Ahmadou Danpullo', 'Founder — Bestinver Group / Ndawara Tea Estate', array['founder'], 'published', 'rare'),
  ('joseph-ichame-kamach', 'Joseph Ichame Kamach', 'Founder — Groupe Kamach', array['founder'], 'published', 'common'),
  ('claude-wilfrid-etoka', 'Claude Wilfrid Etoka', 'CEO — SARPD Oil', array['CEO'], 'published', 'rare'),
  ('moise-katumbi', 'Moise Katumbi', 'Founder — Mining Company Katanga (MCK)', array['founder'], 'published', 'rare'),
  ('jean-louis-billon', 'Jean-Louis Billon', 'CEO — SIFCA Group', array['CEO'], 'published', 'rare'),
  ('abdourahman-boreh', 'Abdourahman Boreh', 'Investor — Soprim Construction', array['investor'], 'published', 'rare'),
  ('nassef-sawiris', 'Nassef Sawiris', 'CEO — OCI N.V.', array['CEO'], 'published', 'rare'),
  ('nathan-kirsh', 'Nathan Kirsh', 'Founder — Kirsh Group / Jetro Holdings', array['founder'], 'published', 'rare'),
  ('mohammed-al-amoudi', 'Mohammed Al Amoudi', 'Founder — MIDROC', array['founder'], 'published', 'rare'),
  ('christian-kerangall', 'Christian Kerangall', 'Founder — Sogafric Holding', array['founder'], 'published', 'common'),
  ('muhammed-jah', 'Muhammed Jah', 'Founder — QuantumNet Group', array['founder'], 'published', 'rare'),
  ('sam-jonah', 'Sam Jonah', 'CEO — Ashanti Goldfields / Jonah Capital', array['CEO'], 'published', 'rare'),
  ('fadi-wazni', 'Fadi Wazni', 'CEO — United Mining Supply Company', array['CEO'], 'published', 'common'),
  ('carlos-gomes-junior', 'Carlos Gomes Junior', 'Investor', array['investor'], 'published', 'common'),
  ('james-mwangi', 'James Mwangi', 'CEO — Equity Group Holdings', array['CEO'], 'published', 'rare'),
  ('sam-matekane', 'Sam Matekane', 'Founder — Matekane Group of Companies', array['founder'], 'published', 'rare'),
  ('george-ryan', 'George Ryan', 'Founder — Ryan''s Construction / Ryan Group', array['founder'], 'published', 'rare'),
  ('joe-lewis', 'Joe Lewis', 'Investor — Tavistock Group', array['investor'], 'published', 'rare'),
  ('joseph-nathaniel-goddard', 'Joseph Nathaniel Goddard', 'Founder — Goddard Enterprises Limited', array['founder'], 'published', 'rare'),
  ('barry-bowen', 'Barry Bowen', 'CEO — Bowen and Bowen Ltd', array['CEO'], 'published', 'rare'),
  ('tobias-lutke', 'Tobias Lutke', 'CEO — Shopify', array['CEO'], 'published', 'epic'),
  ('francis-durman-esquivel', 'Francis Durman Esquivel', 'Founder — Grupo Montecristo', array['founder'], 'published', 'common'),
  ('albert-cavendish-shillingford', 'Albert Cavendish Shillingford', 'Founder — A.C. Shillingford & Co', array['founder'], 'published', 'rare'),
  ('felipe-vicini-lluberes', 'Felipe Vicini Lluberes', 'Investor — Grupo Vicini', array['investor'], 'published', 'rare'),
  ('ricardo-poma', 'Ricardo Poma', 'CEO — Grupo Poma', array['CEO'], 'published', 'rare'),
  ('juan-jose-gutierrez', 'Juan Jose Gutierrez', 'CEO — Corporacion Multi-Inversiones (CMI)', array['CEO'], 'published', 'rare'),
  ('gilbert-bigio', 'Gilbert Bigio', 'Founder — GB Group', array['founder'], 'published', 'rare'),
  ('fredy-nasser', 'Fredy Nasser', 'Founder — Grupo Terra', array['founder'], 'published', 'rare'),
  ('michael-lee-chin', 'Michael Lee-Chin', 'CEO — Portland Holdings Inc.', array['CEO'], 'published', 'rare'),
  ('carlos-slim-helu', 'Carlos Slim Helu', 'Investor — America Movil / Grupo Carso', array['investor'], 'published', 'legendary'),
  ('carlos-pellas', 'Carlos Pellas', 'Investor — Grupo Pellas', array['investor'], 'published', 'rare'),
  ('stanley-motta', 'Stanley Motta', 'Investor — MKH Capital Partners', array['investor'], 'published', 'rare'),
  ('joseph-quentin-charles', 'Joseph Quentin Charles', 'Founder — JQ Charles Group of Companies', array['founder'], 'published', 'common'),
  ('anthony-n-sabga', 'Anthony N. Sabga', 'CEO — ANSA McAL Limited', array['CEO'], 'published', 'rare'),
  ('elon-musk', 'Elon Musk', 'CEO — Tesla / SpaceX', array['CEO'], 'published', 'legendary'),
  ('samir-mane', 'Samir Mane', 'Founder — Balfin Group', array['founder'], 'published', 'rare'),
  ('maria-reig-moles', 'Maria Reig Moles', 'CEO — Reig Capital Group', array['CEO'], 'published', 'common'),
  ('dietrich-mateschitz', 'Dietrich Mateschitz', 'Founder — Red Bull GmbH', array['founder'], 'published', 'rare'),
  ('viktor-prokopenya', 'Viktor Prokopenya', 'Founder — VP Capital / Capital.com', array['founder'], 'published', 'rare'),
  ('alexandre-van-damme', 'Alexandre Van Damme', 'Investor — AB InBev', array['investor'], 'published', 'rare'),
  ('boris-nemsic', 'Boris Nemsic', 'CEO — Telekom Austria / VimpelCom', array['CEO'], 'published', 'rare'),
  ('vasil-bozhkov', 'Vasil Bozhkov', 'Investor — New Games', array['investor'], 'published', 'rare'),
  ('emil-tedeschi', 'Emil Tedeschi', 'Founder — Atlantic Grupa', array['founder'], 'published', 'rare'),
  ('petr-kellner', 'Petr Kellner', 'Founder — PPF Group', array['founder'], 'published', 'rare'),
  ('kjeld-kirk-kristiansen', 'Kjeld Kirk Kristiansen', 'CEO — Lego Group', array['CEO'], 'published', 'rare'),
  ('taavet-hinrikus', 'Taavet Hinrikus', 'Founder — Wise', array['founder'], 'published', 'rare'),
  ('ilkka-paananen', 'Ilkka Paananen', 'CEO — Supercell', array['CEO'], 'published', 'rare'),
  ('bernard-arnault', 'Bernard Arnault', 'CEO — LVMH', array['CEO'], 'published', 'legendary'),
  ('dieter-schwarz', 'Dieter Schwarz', 'Founder — Schwarz Group (Lidl / Kaufland)', array['founder'], 'published', 'legendary'),
  ('spiros-latsis', 'Spiros Latsis', 'Investor — Latsis Group (Eurobank / Hellenic Petroleum)', array['investor'], 'published', 'rare'),
  ('sandor-csanyi', 'Sandor Csanyi', 'CEO — OTP Bank', array['CEO'], 'published', 'rare'),
  ('bjorgolfur-thor-bjorgolfsson', 'Bjorgolfur Thor Bjorgolfsson', 'Founder — Novator Partners', array['founder'], 'published', 'rare'),
  ('michael-oleary', 'Michael O''Leary', 'CEO — Ryanair', array['CEO'], 'published', 'rare'),
  ('giovanni-ferrero', 'Giovanni Ferrero', 'CEO — Ferrero SpA', array['CEO'], 'published', 'epic'),
  ('arnis-riekstins', 'Arnis Riekstins', 'Founder — MikroTik', array['founder'], 'published', 'rare'),
  ('hans-adam-ii', 'Hans-Adam II', 'Investor — LGT Group', array['investor'], 'published', 'rare'),
  ('gediminas-ziemelis', 'Gediminas Ziemelis', 'Founder — Avia Solutions Group', array['founder'], 'published', 'rare'),
  ('lakshmi-mittal', 'Lakshmi Mittal', 'Founder — ArcelorMittal', array['founder'], 'published', 'rare'),
  ('joe-gasan', 'Joe Gasan', 'CEO — Gasan Group', array['CEO'], 'published', 'common'),
  ('anatol-stati', 'Anatol Stati', 'Founder — Ascom Group', array['founder'], 'published', 'rare'),
  ('stefano-pessina', 'Stefano Pessina', 'CEO — Walgreens Boots Alliance', array['CEO'], 'published', 'rare'),
  ('aco-djukanovic', 'Aco Djukanovic', 'Investor — Monte Nova', array['investor'], 'published', 'common'),
  ('charlene-de-carvalho-heineken', 'Charlene de Carvalho-Heineken', 'Investor — Heineken N.V.', array['investor'], 'published', 'rare'),
  ('zhivko-mukaetov', 'Zhivko Mukaetov', 'CEO — Alkaloid AD Skopje', array['CEO'], 'published', 'common'),
  ('kjell-inge-rokke', 'Kjell Inge Rokke', 'Investor — Aker ASA', array['investor'], 'published', 'rare'),
  ('michal-solowow', 'Michal Solowow', 'Founder — Synthos', array['founder'], 'published', 'rare'),
  ('americo-amorim', 'Americo Amorim', 'Founder — Amorim Group / Corticeira Amorim', array['founder'], 'published', 'rare'),
  ('ion-tiriac', 'Ion Tiriac', 'Founder — Tiriac Holdings', array['founder'], 'published', 'rare'),
  ('vladimir-potanin', 'Vladimir Potanin', 'Founder — Interros / Norilsk Nickel', array['founder'], 'published', 'epic'),
  ('miroslav-miskovic', 'Miroslav Miskovic', 'Founder — Delta Holding', array['founder'], 'published', 'rare'),
  ('ivan-jakabovic', 'Ivan Jakabovic', 'Founder — J&T Finance Group', array['founder'], 'published', 'rare'),
  ('igor-akrapovic', 'Igor Akrapovic', 'Founder — Akrapovic', array['founder'], 'published', 'rare'),
  ('amancio-ortega', 'Amancio Ortega', 'Founder — Inditex (Zara)', array['founder'], 'published', 'legendary'),
  ('stefan-persson', 'Stefan Persson', 'Investor — H&M', array['investor'], 'published', 'rare'),
  ('ivan-glasenberg', 'Ivan Glasenberg', 'CEO — Glencore', array['CEO'], 'published', 'rare'),
  ('rinat-akhmetov', 'Rinat Akhmetov', 'Founder — System Capital Management (SCM)', array['founder'], 'published', 'rare'),
  ('richard-branson', 'Richard Branson', 'Founder — Virgin Group', array['founder'], 'published', 'legendary')
on conflict (slug) do nothing;

-- ============================================================
-- COMPANIES
-- ============================================================
insert into companies (slug, name, ticker, industry, headquarters_country, founding_year, description, how_it_makes_money, status) values
  ('apple', 'Apple', 'AAPL', 'Consumer technology', 'United States', 1976, 'Designs consumer hardware, software and services.', 'Primarily hardware sales (iPhone, Mac, wearables) plus a growing services segment.', 'published'),
  ('costco', 'Costco', 'COST', 'Retail', 'United States', 1983, 'Membership-based warehouse retailer.', 'Membership fees drive most profit; product margins are kept intentionally thin.', 'published'),
  ('visa', 'Visa', 'V', 'Payments', 'United States', 1958, 'Operates a global electronic payments network.', 'Takes a small fee on transactions routed through its network; does not lend money directly.', 'published'),
  ('mastercard', 'Mastercard', 'MA', 'Payments', 'United States', 1966, 'Operates a global electronic payments network.', 'Network fees on transactions, similar to Visa.', 'published'),
  ('nvidia', 'NVIDIA', 'NVDA', 'Semiconductors', 'United States', 1993, 'Designs GPUs for gaming, data centers and AI.', 'Sells chips and full computing systems; increasingly for AI data centers.', 'published')
on conflict (slug) do nothing;

-- ============================================================
-- CARDS + entity/topic links + one demo question
-- ============================================================
do $$
declare
  v_card_id uuid;
  v_question_id uuid;
  v_topic_bonds uuid := (select id from topics where slug = 'bonds');
  v_topic_etfs uuid := (select id from topics where slug = 'etfs');
  v_company_costco uuid := (select id from companies where slug = 'costco');
  v_company_apple uuid := (select id from companies where slug = 'apple');
  v_person_jobs uuid := (select id from people where slug = 'steve-jobs');
begin
  -- Card 1: fact
  insert into cards (type, eyebrow, hook, body, difficulty, estimated_seconds, status, quality_score, published_at)
  values ('fact', 'Companies', 'Costco barely profits from what you buy.',
    'Costco runs razor-thin margins on products and makes most of its profit from membership fees. That trade-off buys shopper loyalty and keeps prices aggressively low versus rivals.',
    1, 18, 'published', 0.8, now())
  returning id into v_card_id;
  insert into card_entities (card_id, entity_type, entity_id) values (v_card_id, 'company', v_company_costco);

  -- Card 2: story (part 1 of Apple 1997 arc)
  insert into cards (type, eyebrow, hook, body, difficulty, estimated_seconds, story_sequence, story_total, status, quality_score, published_at)
  values ('story', 'Company history · 1/3', 'Apple was 90 days from bankruptcy in 1997.',
    'Apple had leaked cash for years and inventory was piling up unsold. Steve Jobs returned, killed most product lines, and took a $150M investment from Microsoft — a rival — just to stay alive.',
    1, 25, 1, 3, 'published', 0.85, now())
  returning id into v_card_id;
  insert into card_entities (card_id, entity_type, entity_id) values
    (v_card_id, 'company', v_company_apple),
    (v_card_id, 'person', v_person_jobs);

  -- Card 3: quiz card on bonds, with a real question row
  insert into cards (type, eyebrow, hook, body, difficulty, estimated_seconds, status, quality_score, published_at)
  values ('quiz', 'Quick check', 'When bond yields rise, bond prices...',
    'Bond prices and yields move in opposite directions — this is one of the most tested relationships in fixed income.',
    2, 15, 'published', 0.75, now())
  returning id into v_card_id;
  insert into card_topics (card_id, topic_id) values (v_card_id, v_topic_bonds);

  insert into questions (card_id, prompt, type, difficulty, explanation, estimated_seconds, xp_reward, status)
  values (v_card_id, 'When bond yields rise, what happens to existing bond prices?', 'multiple_choice', 2,
    'Bond prices and yields move inversely. When new bonds pay higher yields, existing lower-yield bonds become less attractive, so their price falls.',
    15, 8, 'published')
  returning id into v_question_id;
  insert into question_topics (question_id, topic_id) values (v_question_id, v_topic_bonds);
  insert into question_options (question_id, label, is_correct, sort_order) values
    (v_question_id, 'They fall', true, 0),
    (v_question_id, 'They rise', false, 1),
    (v_question_id, 'They stay the same', false, 2),
    (v_question_id, 'It depends only on the issuer', false, 3);

  -- Card 4: concept on ETFs
  insert into cards (type, eyebrow, hook, body, difficulty, estimated_seconds, status, quality_score, published_at)
  values ('fact', 'Markets', 'An ETF can hold thousands of stocks, and trade like one.',
    'Exchange-traded funds bundle many securities into a single tradable share, giving instant diversification without buying every underlying stock individually.',
    1, 16, 'published', 0.7, now())
  returning id into v_card_id;
  insert into card_topics (card_id, topic_id) values (v_card_id, v_topic_etfs);
end $$;

commit;

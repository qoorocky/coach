-- ---------------------------------------------------------------
-- V5: Seed 30 exercises + 12 default workouts (spec §8.2 / §8.3-8.6).
-- All content is inserted as PUBLISHED so it ships directly to the app.
-- Idempotency note: Flyway only runs each version once, so we don't
-- gate this with EXISTS checks — re-applying requires baseline reset.
-- ---------------------------------------------------------------
DO $migration$
DECLARE
    v_admin    BIGINT;
    v_rec      RECORD;
    v_draft    UUID;
    v_pub      UUID;
    v_wdraft   UUID;
    v_wpub     UUID;
    v_exid     UUID;
BEGIN
    -- Use the seeded admin (id=1) — present in every env via application.yml seeding.
    SELECT id INTO v_admin FROM cms_users WHERE role = 'ADMIN' ORDER BY id LIMIT 1;
    IF v_admin IS NULL THEN
        RAISE EXCEPTION 'V5 seed aborted: no ADMIN user present in cms_users';
    END IF;

    CREATE TEMP TABLE _ex_map (slug TEXT PRIMARY KEY, pub_id UUID NOT NULL)
        ON COMMIT DROP;
    CREATE TEMP TABLE _wk_map (code TEXT PRIMARY KEY, draft_id UUID NOT NULL, pub_id UUID NOT NULL)
        ON COMMIT DROP;

    -- -----------------------------------------------------------
    -- Exercises (30): published draft + published row, name → uuid map
    -- -----------------------------------------------------------
    FOR v_rec IN
        SELECT * FROM (VALUES
            -- cardio
            ('ex_001', '開合跳', 'Jumping Jacks',           '雙腳開合配合手臂上下擺動，全身性心肺熱身。', 'beginner',     'cardio', '["全身","心肺"]'::jsonb),
            ('ex_002', '高抬腿', 'High Knees',              '原地抬膝至腰高，快節奏帶動心率。',                'beginner',     'cardio', '["股四頭肌","髂腰肌","心肺"]'::jsonb),
            ('ex_003', '原地慢跑', 'Jogging in Place',      '原地小幅慢跑，適合熱身與恢復期。',                'beginner',     'cardio', '["小腿","心肺"]'::jsonb),
            ('ex_004', '登山者', 'Mountain Climbers',       '高棒式下交替抬膝向前，鍛鍊核心與心肺。',          'intermediate', 'cardio', '["核心","肩膀","髂腰肌"]'::jsonb),
            ('ex_005', '波比跳', 'Burpees',                  '下蹲、伏地、跳起合一的全身爆發動作。',            'advanced',     'cardio', '["全身"]'::jsonb),
            ('ex_006', '半波比跳', 'Half Burpees',          '波比跳省略伏地挺身的入門版本。',                  'intermediate', 'cardio', '["全身"]'::jsonb),
            ('ex_007', '滑冰者跳躍', 'Skater Jumps',        '左右交替側跳並收腳，鍛鍊單腿穩定。',              'intermediate', 'cardio', '["臀肌","股四頭肌","心肺"]'::jsonb),
            -- lower
            ('ex_008', '徒手深蹲', 'Bodyweight Squats',     '雙腳與肩同寬，臀後推下蹲到大腿平行地面。',        'beginner',     'lower',  '["股四頭肌","臀肌"]'::jsonb),
            ('ex_009', '深蹲跳', 'Jump Squats',             '深蹲後爆發跳起，落地緩衝再接下一下。',            'advanced',     'lower',  '["股四頭肌","臀肌","小腿"]'::jsonb),
            ('ex_010', '弓步蹲', 'Stationary Lunges',       '前後分腿下蹲，前膝對腳尖、後膝不貼地。',          'beginner',     'lower',  '["股四頭肌","臀肌"]'::jsonb),
            ('ex_011', '交替跳躍弓步', 'Jumping Lunges',    '弓步姿勢跳起換腳，落地立刻下一下。',              'advanced',     'lower',  '["股四頭肌","臀肌","小腿"]'::jsonb),
            ('ex_012', '側弓步', 'Side Lunges',             '單側橫向跨步下蹲，臀後推、膝對腳尖。',            'intermediate', 'lower',  '["臀中肌","股四頭肌","內收肌"]'::jsonb),
            ('ex_013', '單腿臀橋', 'Single-Leg Glute Bridge','仰躺單腳屈膝撐地，臀部上推至身體呈直線。',        'intermediate', 'lower',  '["臀大肌","膕繩肌"]'::jsonb),
            ('ex_014', '相撲深蹲', 'Sumo Squats',           '腳距大開、腳尖外八的寬步距深蹲。',                'beginner',     'lower',  '["臀肌","內收肌","股四頭肌"]'::jsonb),
            ('ex_015', '深蹲到抬腿', 'Squat to Knee Raise', '深蹲起身瞬間抬單膝，左右交替。',                  'beginner',     'lower',  '["股四頭肌","臀肌","核心"]'::jsonb),
            -- upper / compound
            ('ex_016', '標準伏地挺身', 'Push-Ups',          '手撐略寬肩，身體呈直線下放至胸部近地。',          'intermediate', 'upper',  '["胸大肌","三頭肌","前三角肌"]'::jsonb),
            ('ex_017', '跪姿伏地挺身', 'Knee Push-Ups',     '膝蓋著地的入門伏地挺身。',                        'beginner',     'upper',  '["胸大肌","三頭肌"]'::jsonb),
            ('ex_018', '鑽石伏地挺身', 'Diamond Push-Ups',  '雙手成鑽石狀於胸下方的窄距伏地挺身。',            'advanced',     'upper',  '["三頭肌","胸大肌"]'::jsonb),
            ('ex_019', '伏地挺身加肩膀點擊', 'Push-Up to Shoulder Tap','伏地挺身一下後輪流以手點對側肩。','advanced','upper','["胸大肌","三頭肌","核心"]'::jsonb),
            ('ex_020', '標準平板支撐', 'Plank',             '手肘撐地，身體保持直線靜止。',                    'beginner',     'upper',  '["核心","腹直肌","腹橫肌"]'::jsonb),
            ('ex_021', '側平板', 'Side Plank',              '單側手肘撐地，身體側向保持一直線。',              'intermediate', 'upper',  '["腹斜肌","核心"]'::jsonb),
            ('ex_022', '平板轉體', 'Plank Rotation',        '高棒式下交替伸手摸對側腳踝。',                    'intermediate', 'upper',  '["核心","腹斜肌"]'::jsonb),
            ('ex_023', '三頭肌撐體', 'Tricep Dips',         '坐姿手撐椅緣，臀部離椅做下沉動作。',              'intermediate', 'upper',  '["三頭肌","前三角肌"]'::jsonb),
            -- core
            ('ex_024', '仰臥捲腹', 'Crunches',              '仰躺屈膝，上半身用核心力量起身。',                'beginner',     'core',   '["腹直肌"]'::jsonb),
            ('ex_025', '俄羅斯轉體', 'Russian Twists',      '坐姿後傾雙腳離地，雙手交替點地兩側。',            'intermediate', 'core',   '["腹斜肌","腹直肌"]'::jsonb),
            ('ex_026', '死蟲式', 'Dead Bug',                '仰躺對側手腳交替伸直放下，下背貼地。',            'beginner',     'core',   '["核心","腹橫肌"]'::jsonb),
            ('ex_027', '剪刀腳', 'Flutter Kicks',           '仰躺雙腿離地快速上下交替踢動。',                  'intermediate', 'core',   '["下腹","髂腰肌"]'::jsonb),
            ('ex_028', '腳踏車捲腹', 'Bicycle Crunches',    '仰躺對側手肘碰膝，模擬騎腳踏車節奏。',            'intermediate', 'core',   '["腹斜肌","腹直肌"]'::jsonb),
            ('ex_029', 'V字坐姿', 'V-Ups',                  '仰躺同時抬腿與上身成 V 字，再緩降。',              'advanced',     'core',   '["腹直肌","髂腰肌"]'::jsonb),
            ('ex_030', '反向捲腹', 'Reverse Crunches',      '仰躺屈膝抬腿，骨盆後捲帶起臀部離地。',            'beginner',     'core',   '["下腹","腹直肌"]'::jsonb)
        ) AS t(slug, zh, en, dsc, diff, cat, muscles)
    LOOP
        INSERT INTO exercise_drafts(
            name_zh, name_en, description, difficulty, primary_muscles, category,
            status, current_version, created_by, updated_by
        ) VALUES (
            v_rec.zh, v_rec.en, v_rec.dsc, v_rec.diff, v_rec.muscles, v_rec.cat,
            'PUBLISHED', 1, v_admin, v_admin
        ) RETURNING id INTO v_draft;

        v_pub := gen_random_uuid();
        INSERT INTO exercises_published(
            id, draft_id, version, name_zh, name_en, description, difficulty,
            primary_muscles, category, is_active, published_by
        ) VALUES (
            v_pub, v_draft, 1, v_rec.zh, v_rec.en, v_rec.dsc, v_rec.diff,
            v_rec.muscles, v_rec.cat, TRUE, v_admin
        );

        INSERT INTO _ex_map(slug, pub_id) VALUES (v_rec.slug, v_pub);
    END LOOP;

    -- -----------------------------------------------------------
    -- Workouts (W01–W12): draft + published rows
    -- -----------------------------------------------------------
    FOR v_rec IN
        SELECT * FROM (VALUES
            ('W01', 'W01 新手入門 8 分鐘',     '完全沒運動習慣的人也能跟上的 30s/30s 入門課程。', 'beginner',     480,  60, 'standard', '["新手","全身"]'::jsonb),
            ('W02', 'W02 初階全身 12 分鐘',   '4 動作 Tabata 變體（40s/20s × 3 輪），喚醒全身。',  'beginner',     720,  90, 'tabata',   '["新手","Tabata"]'::jsonb),
            ('W03', 'W03 核心喚醒 10 分鐘',   '6 動作環狀核心訓練，30s/30s × 2 輪。',              'beginner',     720,  65, 'standard', '["核心"]'::jsonb),
            ('W04', 'W04 下肢啟動 15 分鐘',   '金字塔下肢訓練，工作時間由 20s 逐步拉到 40s。',    'beginner',     900, 110, 'standard', '["下肢"]'::jsonb),
            ('W05', 'W05 燃脂 20 分鐘 HIIT',  '10 動作標準 HIIT，40s/20s × 2 輪，全身燃脂。',      'intermediate', 1200, 180, 'standard', '["燃脂","全身"]'::jsonb),
            ('W06', 'W06 核心雕塑 15 分鐘',   'Tabata 核心：3 動作 × 8 輪 × 20s/10s。',            'intermediate', 900, 120, 'tabata',   '["核心","Tabata"]'::jsonb),
            ('W07', 'W07 上肢力量 18 分鐘',   'EMOM 上肢循環，6 動作 × 3 輪。',                    'intermediate', 1080, 130, 'emom',     '["上肢","EMOM"]'::jsonb),
            ('W08', 'W08 下半身燃燒 20 分鐘', '6 動作 45s/15s × 3 輪的下肢環狀訓練。',             'intermediate', 1200, 170, 'standard', '["下肢"]'::jsonb),
            ('W09', 'W09 快速燃脂 10 分鐘',   'Tabata 雙動作交替（20s/10s × 4 輪 × 2 組）。',      'intermediate', 600,  95, 'tabata',   '["燃脂","Tabata"]'::jsonb),
            ('W10', 'W10 地獄 15 分鐘',       'AMRAP 15 分鐘：波比跳 10、深蹲跳 15、伏地挺身 10、跳躍弓步 20、V 字坐姿 15，反覆計輪。', 'advanced', 900, 190, 'amrap', '["AMRAP","挑戰"]'::jsonb),
            ('W11', 'W11 全身轟炸 25 分鐘',   '10 動作 50s/10s × 2 輪的高強度複合 HIIT。',         'advanced',    1500, 280, 'standard', '["全身","挑戰"]'::jsonb),
            ('W12', 'W12 Tabata 究極 16 分鐘','4 組 Tabata（波比跳／深蹲跳／登山者／跳躍弓步）。', 'advanced',     960, 200, 'tabata',   '["Tabata","挑戰"]'::jsonb)
        ) AS t(code, name, dsc, diff, dur, kcal, mode, tags)
    LOOP
        INSERT INTO workout_drafts(
            name, description, difficulty, estimated_duration_sec, estimated_calories,
            tags, mode, status, current_version, created_by_type, created_by, updated_by
        ) VALUES (
            v_rec.name, v_rec.dsc, v_rec.diff, v_rec.dur, v_rec.kcal,
            v_rec.tags, v_rec.mode, 'PUBLISHED', 1, 'system', v_admin, v_admin
        ) RETURNING id INTO v_wdraft;

        v_wpub := gen_random_uuid();
        INSERT INTO workouts_published(
            id, draft_id, version, name, description, difficulty,
            estimated_duration_sec, estimated_calories, tags, mode,
            created_by_type, is_active, published_by
        ) VALUES (
            v_wpub, v_wdraft, 1, v_rec.name, v_rec.dsc, v_rec.diff,
            v_rec.dur, v_rec.kcal, v_rec.tags, v_rec.mode,
            'system', TRUE, v_admin
        );

        INSERT INTO _wk_map(code, draft_id, pub_id) VALUES (v_rec.code, v_wdraft, v_wpub);
    END LOOP;

    -- -----------------------------------------------------------
    -- Workout segments — flat list (code, order, exercise_slug, dur_sec, rest_sec, rounds)
    -- -----------------------------------------------------------
    FOR v_rec IN
        SELECT * FROM (VALUES
            -- W01 新手入門 8 分鐘 (standard 30/30)
            ('W01',  1, 'ex_003', 60, 30, 1),
            ('W01',  2, 'ex_008', 30, 30, 1),
            ('W01',  3, 'ex_017', 30, 30, 1),
            ('W01',  4, 'ex_001', 30, 30, 1),
            ('W01',  5, 'ex_010', 30, 30, 1),
            ('W01',  6, 'ex_020', 30, 30, 1),
            ('W01',  7, 'ex_024', 30,  0, 1),

            -- W02 初階全身 12 分鐘 (tabata 40/20 × 3 rounds)
            ('W02',  1, 'ex_001', 40, 20, 3),
            ('W02',  2, 'ex_008', 40, 20, 3),
            ('W02',  3, 'ex_017', 40, 20, 3),
            ('W02',  4, 'ex_020', 40, 20, 3),

            -- W03 核心喚醒 10 分鐘 (standard 30/30 × 2 rounds)
            ('W03',  1, 'ex_026', 30, 30, 2),
            ('W03',  2, 'ex_024', 30, 30, 2),
            ('W03',  3, 'ex_030', 30, 30, 2),
            ('W03',  4, 'ex_020', 30, 30, 2),
            ('W03',  5, 'ex_013', 30, 30, 2),
            ('W03',  6, 'ex_013', 30, 30, 2),

            -- W04 下肢啟動 15 分鐘 (pyramid 20s → 30s → 40s, 5 exercises × 3 tiers)
            ('W04',  1, 'ex_008', 20, 20, 1),
            ('W04',  2, 'ex_010', 20, 20, 1),
            ('W04',  3, 'ex_012', 20, 20, 1),
            ('W04',  4, 'ex_014', 20, 20, 1),
            ('W04',  5, 'ex_015', 20, 20, 1),
            ('W04',  6, 'ex_008', 30, 20, 1),
            ('W04',  7, 'ex_010', 30, 20, 1),
            ('W04',  8, 'ex_012', 30, 20, 1),
            ('W04',  9, 'ex_014', 30, 20, 1),
            ('W04', 10, 'ex_015', 30, 20, 1),
            ('W04', 11, 'ex_008', 40, 20, 1),
            ('W04', 12, 'ex_010', 40, 20, 1),
            ('W04', 13, 'ex_012', 40, 20, 1),
            ('W04', 14, 'ex_014', 40, 20, 1),
            ('W04', 15, 'ex_015', 40,  0, 1),

            -- W05 燃脂 20 分鐘 HIIT (standard 40/20, 10 exercises × 2 rounds)
            ('W05',  1, 'ex_002', 40, 20, 2),
            ('W05',  2, 'ex_008', 40, 20, 2),
            ('W05',  3, 'ex_004', 40, 20, 2),
            ('W05',  4, 'ex_016', 40, 20, 2),
            ('W05',  5, 'ex_007', 40, 20, 2),
            ('W05',  6, 'ex_025', 40, 20, 2),
            ('W05',  7, 'ex_006', 40, 20, 2),
            ('W05',  8, 'ex_020', 40, 20, 2),
            ('W05',  9, 'ex_001', 40, 20, 2),
            ('W05', 10, 'ex_012', 40, 20, 2),

            -- W06 核心雕塑 15 分鐘 (tabata 20/10 × 8 rounds × 3 groups)
            ('W06',  1, 'ex_028', 20, 10, 8),
            ('W06',  2, 'ex_025', 20, 10, 8),
            ('W06',  3, 'ex_022', 20, 10, 8),

            -- W07 上肢力量 18 分鐘 (emom 60s × 3 rounds × 6 actions)
            ('W07',  1, 'ex_016', 60,  0, 3),
            ('W07',  2, 'ex_023', 60,  0, 3),
            ('W07',  3, 'ex_020', 60,  0, 3),
            ('W07',  4, 'ex_019', 60,  0, 3),
            ('W07',  5, 'ex_021', 60,  0, 3),
            ('W07',  6, 'ex_021', 60,  0, 3),

            -- W08 下半身燃燒 20 分鐘 (standard 45/15 × 3 rounds × 6 actions)
            ('W08',  1, 'ex_008', 45, 15, 3),
            ('W08',  2, 'ex_010', 45, 15, 3),
            ('W08',  3, 'ex_009', 45, 15, 3),
            ('W08',  4, 'ex_012', 45, 15, 3),
            ('W08',  5, 'ex_013', 45, 15, 3),
            ('W08',  6, 'ex_014', 45, 15, 3),

            -- W09 快速燃脂 10 分鐘 (tabata double 20/10 × 4 rounds × 4 actions)
            ('W09',  1, 'ex_001', 20, 10, 4),
            ('W09',  2, 'ex_002', 20, 10, 4),
            ('W09',  3, 'ex_006', 20, 10, 4),
            ('W09',  4, 'ex_007', 20, 10, 4),

            -- W10 地獄 15 分鐘 (amrap, single 15-min segment, exercise list lives in description)
            ('W10',  1, 'ex_005', 900, 0, 1),

            -- W11 全身轟炸 25 分鐘 (standard 50/10, 10 actions × 2 rounds)
            ('W11',  1, 'ex_005', 50, 10, 2),
            ('W11',  2, 'ex_009', 50, 10, 2),
            ('W11',  3, 'ex_004', 50, 10, 2),
            ('W11',  4, 'ex_011', 50, 10, 2),
            ('W11',  5, 'ex_018', 50, 10, 2),
            ('W11',  6, 'ex_022', 50, 10, 2),
            ('W11',  7, 'ex_029', 50, 10, 2),
            ('W11',  8, 'ex_006', 50, 10, 2),
            ('W11',  9, 'ex_002', 50, 10, 2),
            ('W11', 10, 'ex_019', 50, 10, 2),

            -- W12 Tabata 究極 16 分鐘 (tabata 20/10 × 8 rounds × 4 actions)
            ('W12',  1, 'ex_005', 20, 10, 8),
            ('W12',  2, 'ex_009', 20, 10, 8),
            ('W12',  3, 'ex_004', 20, 10, 8),
            ('W12',  4, 'ex_011', 20, 10, 8)
        ) AS t(code, idx, slug, dur, rest, rounds)
    LOOP
        SELECT pub_id INTO v_exid FROM _ex_map WHERE slug = v_rec.slug;
        IF v_exid IS NULL THEN
            RAISE EXCEPTION 'V5 seed aborted: segment refers to missing exercise %', v_rec.slug;
        END IF;
        SELECT draft_id, pub_id INTO v_wdraft, v_wpub FROM _wk_map WHERE code = v_rec.code;
        IF v_wdraft IS NULL THEN
            RAISE EXCEPTION 'V5 seed aborted: segment refers to missing workout %', v_rec.code;
        END IF;

        INSERT INTO workout_draft_segments(
            workout_draft_id, exercise_id, order_index, duration_sec, rest_after_sec, rounds
        ) VALUES (
            v_wdraft, v_exid, v_rec.idx, v_rec.dur, v_rec.rest, v_rec.rounds
        );

        INSERT INTO workout_published_segments(
            segment_id, workout_published_id, exercise_id, order_index, duration_sec, rest_after_sec, rounds
        ) VALUES (
            gen_random_uuid(), v_wpub, v_exid, v_rec.idx, v_rec.dur, v_rec.rest, v_rec.rounds
        );
    END LOOP;
END
$migration$;

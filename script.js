const LANGUAGE_STORAGE_KEY = "lance-lang";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = new Set(["en", "zh"]);
const TRANSLATION_SKIP_SELECTOR = [
  ".title",
  ".video-prompt",
  ".video-full-caption",
  ".video-understanding-field",
  ".video-understanding-primary",
  ".video-understanding-answer",
  ".understanding-question",
  ".understanding-answer",
].join(", ");

let currentLanguage = DEFAULT_LANGUAGE;
let i18nTextNodes = null;
let i18nAttributeTargets = null;

const i18nMessages = {
  en: {
    locale: "en",
    languageName: "English",
    languageShort: "EN",
    selectLanguage: "Select language",
    languageOptions: "Language options",
    copyCitation: "Copy citation",
    citationCopied: "Citation copied",
    copyFailed: "Copy failed",
    closePreview: "Close preview",
    videoPreview: "Video preview",
    figurePreview: "Figure preview",
    figure: "Figure",
    demo: "Demo",
    prompt: "Prompt",
    question: "Question",
    response: "Response",
    videoUnderstanding: "Video Understanding",
    imageUnderstanding: "Image Understanding",
    imageUnderstandingCase: "Image understanding case",
    videoUnderstandingCase: "video understanding case",
    openPreview: "Open {label} preview",
    openItem: "Open {label}",
  },
  zh: {
    locale: "zh-CN",
    languageName: "简体中文",
    languageShort: "中",
    selectLanguage: "选择语言",
    languageOptions: "语言选项",
    copyCitation: "复制引用",
    citationCopied: "引用已复制",
    copyFailed: "复制失败",
    closePreview: "关闭预览",
    videoPreview: "视频预览",
    figurePreview: "图像预览",
    figure: "图像",
    demo: "演示",
    prompt: "Prompt",
    question: "Question",
    response: "Response",
    videoUnderstanding: "视频理解",
    imageUnderstanding: "图像理解",
    imageUnderstandingCase: "图像理解案例",
    videoUnderstandingCase: "视频理解案例",
    openPreview: "打开{label}预览",
    openItem: "打开{label}",
  },
};

const i18nMetadata = {
  zh: {
    description:
      "Lance 是字节跳动的研究项目：一个 3B 激活参数的原生统一多模态模型，支持图像与视频理解、生成和编辑。",
    ogDescription:
      "字节跳动 Lance 是一个 3B 激活参数的统一多模态模型，支持图像与视频理解、生成和编辑。",
    twitterDescription:
      "一个面向图像与视频理解、生成和编辑的字节跳动 3B 激活参数统一多模态模型。",
    imageAlt: "Lance：字节跳动图像与视频统一多模态模型",
  },
};

const i18nText = {
  zh: {
    "Overview": "概览",
    "Videos": "视频",
    "Text-to-Video": "文本到视频",
    "Image-to-Video": "图像到视频",
    "Video Editing": "视频编辑",
    "Multi-turn Editing": "多轮编辑",
    "Intelligent Video": "智能视频",
    "Video Understanding": "视频理解",
    "Images": "图像",
    "Text-to-Image": "文本到图像",
    "Image Editing": "图像编辑",
    "Image Understanding": "图像理解",
    "Framework": "框架",
    "Benchmarks": "评测",
    "Multimodal radar": "多模态雷达图",
    "Citation": "引用",
    "More": "更多",
    "Equal contribution": "共同一作",
    "Corresponding authors": "通讯作者",
    "Project lead": "项目负责人",
    "Intelligent Creation Team, ByteDance": "字节跳动智能创作团队",
    "Lance is a 3B native unified multimodal model for image and video understanding, generation, and editing, trained from scratch within a training budget of no more than 128 GPUs using a staged multi-task recipe.":
      "Lance 是一个 3B 原生统一多模态模型，面向图像与视频的理解、生成和编辑任务，并通过阶段式多任务训练方案，在不超过 128 张 GPU 的训练预算内从头训练完成。",
    "Note:": "说明：",
    "Lance is a research project rather than a polished product model.":
      "Lance 是一个研究项目，而不是经过充分产品化打磨的模型。",
    "The released checkpoint was trained with up to 128 A100 GPUs, with training conducted up to 768x768 image generation and 480p, 12 FPS video generation. Our goal is to share a research artifact for studying unified image/video understanding, generation, and editing under a relatively small model and limited compute budget. Output quality may vary across prompts, resolutions, duration, motion complexity, and editing scenarios, and we see further opportunities to improve the post-training recipe. We appreciate constructive feedback from the community as we continue improving the project.":
      "开源 checkpoint 的训练使用最多 128 张 A100 GPU，训练阶段覆盖最高 768x768 图像生成，以及 480p、12 FPS 视频生成。我们的目标是在相对较小模型规模和有限算力预算下，分享一个用于研究统一图像/视频理解、生成与编辑的研究 artifact。输出质量可能会因提示词、分辨率、时长、运动复杂度和编辑场景而变化，后训练方案也仍有进一步改进空间。欢迎社区提供建设性反馈，帮助我们持续改进项目。",
    "Paper": "论文",
    "Code": "代码",
    "Demo": "演示",
    "Video preview": "视频预览",
    "Video Reasoning": "视频推理",
    "Nine text-conditioned cases focused on character motion, fantasy animals, two-person interaction, and cinematic dreamlike scenes.":
      "九个文本条件生成案例，聚焦角色运动、幻想动物、双人互动和电影感梦境场景。",
    "Starting from a single image, Lance preserves subject identity and scene composition while synthesizing natural motion, camera movement, and temporal detail.":
      "从单张输入图像出发，Lance 在保持主体身份和场景构图的同时，合成自然运动、镜头变化和时序细节。",
    "Input image": "输入图像",
    "Generated video": "生成视频",
    "Displayed with": "展示结果经过",
    "2x super-resolution": "2 倍超分辨率",
    "2x frame interpolation": "2 倍帧插值",
    "and": "以及",
    "Nine prompt-driven single-step and compositional editing cases spanning background transformation, object addition and removal, subject replacement, appearance restyling, stylization, and action edits.":
      "九个由提示词驱动的单步与组合式视频编辑案例，覆盖背景变换、物体增删、主体替换、外观重塑、风格化和动作编辑。",
    "Source video followed by four linked edits on the same subject: replacement, accessory addition, background rewrite, and motion update.":
      "以源视频为起点，对同一主体连续执行四步关联编辑：发型替换、配饰添加、背景重写和动作更新。",
    "Structured planning and physics-oriented examples that probe control over multi-step spatial behavior.":
      "结构化规划和物理导向案例，用于检验模型对多步空间行为的控制能力。",
    "Selected video question answering and captioning cases that evaluate temporal reasoning, motion recognition, and concise-to-detailed description.":
      "精选视频问答与字幕生成案例，用于评估时序推理、运动识别，以及从简洁到详细的描述能力。",
    "Representative text-to-image outputs spanning photorealistic, stylized, compositional, and typography-heavy prompts.":
      "代表性文本到图像结果，覆盖写实、风格化、组合式和强文字排版提示词。",
    "Instruction-guided image editing cases showing local replacement, style transfer, object-aware modifications, and layout-preserving transformations.":
      "指令引导的图像编辑案例，展示局部替换、风格迁移、物体感知修改和保持布局的变换。",
    "Six selected visual question answering cases spanning charts, trade data, OCR, documents, landmarks, and natural phenomena.":
      "六个精选视觉问答案例，覆盖图表、贸易数据、OCR、文档、地标和自然现象。",
    "Lance keeps a shared interleaved sequence for text, image, and video context, then separates semantic understanding and visual generation through dedicated experts.":
      "Lance 使用共享的交错序列承载文本、图像和视频上下文，并通过专门的专家模块解耦语义理解与视觉生成。",
    "Lance combines semantic ViT tokens for understanding, clean/noisy VAE latents for generation, generalized 3D causal attention, and MaPE to reduce positional interference among heterogeneous visual tokens.":
      "Lance 结合用于理解的语义 ViT token、用于生成的干净/含噪 VAE latent、广义 3D 因果注意力，以及用于降低异构视觉 token 位置干扰的 MaPE。",
    "Comparison on multimodal benchmarks": "多模态评测对比",
    "Radar charts compare Lance with representative unified and task-specialized baselines.":
      "雷达图将 Lance 与代表性的统一模型和任务专用基线进行比较。",
    "Detailed tables:": "详细表格：",
    "Image generation on GenEVAL": "GenEVAL 图像生成评测",
    "GenEVAL measures object count, color, position, and attribute binding. Lance ties the best overall score among listed unified models while remaining a compact 3B model.":
      "GenEVAL 衡量物体数量、颜色、位置和属性绑定能力。Lance 在保持 3B 紧凑规模的同时，在列出的统一模型中并列取得最佳总体成绩。",
    "Image generation on DPG-Bench": "DPG-Bench 图像生成评测",
    "DPG-Bench stresses complex prompt following across global, entity, attribute, relation, and other compositional dimensions; Lance is especially strong on relation grounding.":
      "DPG-Bench 强调复杂提示词跟随能力，覆盖全局、实体、属性、关系及其他组合维度；Lance 在关系 grounding 上表现尤其突出。",
    "Image editing on GEdit-Bench": "GEdit-Bench 图像编辑评测",
    "GEdit-Bench evaluates instruction-guided image editing across eleven edit categories; Lance delivers the strongest unified-model average among listed systems.":
      "GEdit-Bench 从十一个编辑类别评估指令引导图像编辑；Lance 在列出的统一模型中取得最强平均表现。",
    "GEdit-Bench evaluates instruction-guided edits such as background, color, material, subject, style, and tone changes. Lance reports the best average score among listed unified models.":
      "GEdit-Bench 评估背景、颜色、材质、主体、风格和色调等指令引导编辑。Lance 在列出的统一模型中取得最佳平均分。",
    "Video generation on VBench": "VBench 视频生成评测",
    "VBench measures video quality, subject/background consistency, motion, dynamics, aesthetics, imaging quality, and semantic alignment; Lance remains competitive with specialized video generators.":
      "VBench 衡量视频质量、主体/背景一致性、运动、动态程度、美学、成像质量和语义对齐；Lance 与专用视频生成模型相比仍具竞争力。",
    "VBench covers video quality, semantic alignment, object attributes, spatial relations, and motion-related dimensions. Lance obtains the top total score in the unified model group.":
      "VBench 覆盖视频质量、语义对齐、物体属性、空间关系和运动相关维度。Lance 在统一模型组中取得最高总分。",
    "Video understanding on MVBench": "MVBench 视频理解评测",
    "MVBench evaluates temporal and causal video reasoning across diverse tasks; Lance improves over prior unified models while retaining generation and editing capabilities.":
      "MVBench 从多类任务评估时序与因果视频推理；Lance 在保留生成和编辑能力的同时，优于此前的统一模型。",
    "MVBench evaluates video understanding across action, object, spatial, temporal, and reasoning categories. Lance achieves the best average score among listed unified models.":
      "MVBench 从动作、物体、空间、时序和推理等类别评估视频理解。Lance 在列出的统一模型中取得最佳平均分。",
    "Scroll horizontally to inspect all metrics.": "横向滚动查看全部指标。",
    "GenEVAL image generation results. Higher scores are better.":
      "GenEVAL 图像生成结果，分数越高越好。",
    "DPG-Bench image generation results. Higher scores are better.":
      "DPG-Bench 图像生成结果，分数越高越好。",
    "GEdit-Bench image editing results. Higher scores are better.":
      "GEdit-Bench 图像编辑结果，分数越高越好。",
    "VBench video generation results. Higher scores are better.":
      "VBench 视频生成结果，分数越高越好。",
    "MVBench video understanding results. Higher scores are better.":
      "MVBench 视频理解结果，分数越高越好。",
    "Method": "方法",
    "Model": "模型",
    "# Params.": "参数量",
    "Overall↑": "总体↑",
    "Avg/G-O↑": "平均/G-O↑",
    "Total Score↑": "总分↑",
    "Quality Score": "质量分",
    "Semantic Score": "语义分",
    "Single Obj.": "单物体",
    "Two Obj.": "双物体",
    "Counting": "计数",
    "Colors": "颜色",
    "Position": "位置",
    "Color Attri.": "颜色属性",
    "Global": "全局",
    "Entity": "实体",
    "Attribute": "属性",
    "Relation": "关系",
    "Other": "其他",
    "Subj. Consist.": "主体一致性",
    "Bkg. Consist.": "背景一致性",
    "Temp. Flicker": "时序闪烁",
    "Motion Smooth.": "运动平滑度",
    "Dynamic Degree": "动态程度",
    "Aesthetic Quality": "美学质量",
    "Imaging Quality": "成像质量",
    "Object Class": "物体类别",
    "Multi. Objects": "多物体",
    "Human Action": "人物动作",
    "Color": "颜色",
    "Spatial Relation": "空间关系",
    "Scene": "场景",
    "Appear. Style": "外观风格",
    "Temp. Style": "时序风格",
    "Overall Consist.": "整体一致性",
    "Avg.↑": "平均↑",
    "Generation-only models": "仅生成模型",
    "Understanding-only models": "仅理解模型",
    "Unified models": "统一模型",
    "† indicates methods that use LLM rewriters for prompt rewriting before generation.":
      "† 表示在生成前使用 LLM 重写器进行提示词改写的方法。",
    "† indicates methods reported with LLM rewriting or model-specific prompt rewriting.":
      "† 表示使用 LLM 重写或模型专用提示词改写报告的方法。",
    "Surfing animal character": "冲浪动物角色",
    "A medium-close shot shows a red panda wearing a gold-trimmed cap and travel satchel on a bright seaside wave with a painted surfboard, foam spray, and a glowing summer sky. Subject fills frame; premium detail, clear focus, lively eyes, readable motion. tracking shot. It rides the wave, lifts one paw in balance, and laughs as spray catches the light.":
      "中近景展示一只戴着金边帽、背着旅行挎包的小熊猫，在明亮海边浪花上踩着彩绘冲浪板前行，周围有飞溅泡沫和发光的夏日天空。主体充满画面，细节精致、焦点清晰、眼神灵动、动作易读。跟拍镜头中，它乘浪前进，抬起一只爪子保持平衡，并在浪花映光时开心大笑。",
    "Robot and dog duet": "机器人与小狗二重奏",
    "A premium animated-film shot shows a brass robot playing violin in a lantern-lit city square with one puppy seated nearby under warm evening light. The main subject occupies at least two-thirds of the frame and remains the clear visual focus. The scene is whimsical, beautiful, and richly detailed, with strong character focus and elegant atmosphere. fixed shot. The robot draws the bow in smooth arcs while the puppy listens quietly.":
      "高品质动画电影镜头中，一个黄铜机器人在灯笼点亮的城市广场拉小提琴，旁边有一只小狗安静坐着，沐浴在温暖暮光下。主体占据至少三分之二画面，并始终是清晰视觉焦点。场景奇幻、美观且细节丰富，角色聚焦强，氛围优雅。固定镜头中，机器人以平滑弧线拉动琴弓，小狗安静聆听。",
    "Wizard cat with magic": "会魔法的巫师猫",
    "A medium-close shot shows a Persian cat wearing ornate spectacles and a velvet academic robe inside a candlelit salon with carved shelves, chandeliers, and mosaic floors. The cat fills the frame with crisp fur detail and lively eyes. fixed shot. It lifts a slender magic wand and traces a soft glowing arc through the air.":
      "中近景展示一只波斯猫，戴着华丽眼镜，穿着天鹅绒学院长袍，置身烛光沙龙，周围有雕花书架、吊灯和马赛克地面。猫占满画面，毛发细节清晰，眼神灵动。固定镜头中，它举起细长魔杖，在空中划出柔和发光的弧线。",
    "Tropical sunset shoreline": "热带日落海岸",
    "A cinematic landscape shot shows a tropical coastline at sunset with pink sky, moving waves, black rocks, and palms swaying in warm wind. The scene is majestic, highly aesthetic, and rich in layered natural detail, with refined atmosphere and premium scenic clarity. wide shot. The sun sinks toward the horizon while wave foam advances and retreats along the shore.":
      "电影感风景镜头展示日落时的热带海岸线：粉色天空、涌动海浪、黑色礁石，以及在暖风中摇曳的棕榈。场景壮阔、审美精致，并富有层次化自然细节，氛围高级，景观清晰。广角镜头中，太阳缓缓沉向地平线，浪沫沿海岸推进又退去。",
    "Motorcycle through canyon": "摩托穿越峡谷",
    "A close-to-medium cinematic shot shows a handsome motorcyclist riding a classic black motorcycle along a coastal road with cliffs, sea spray, and dramatic sky. The background stays bright, layered, and aesthetically refined, with luminous depth and elegant environmental variation while remaining secondary to the main subject. The eyes are lively and expressive, with subtle blinking, natural gaze shifts, and gentle movement in the brows and mouth that keep the face vivid on camera. The subject is beautiful, highly detailed, and photographed with a premium cinematic aesthetic. The subject occupies at least two-thirds of the frame, with beautiful styling, refined facial detail, convincing skin texture, and anatomically correct hands. The rider's body posture matches the bike's motion and the hands grip the handlebars naturally. the camera follows from the side as the motorcycle leans through a curve.":
      "近中景电影镜头展示一位英俊骑手驾驶经典黑色摩托，沿有悬崖、海雾和戏剧化天空的海岸公路行驶。背景明亮、有层次且审美精致，具备发光般的深度和优雅的环境变化，同时仍服务于主体。人物眼神生动，伴随细微眨眼、自然视线转移，以及眉眼和嘴部轻微运动，使面部在镜头中保持鲜活。主体精致且细节丰富，以高级电影质感呈现，占据至少三分之二画面，造型优美、面部细节细腻、肤质可信、手部结构正确。骑手姿态与车身运动匹配，双手自然握住车把；侧向跟拍镜头记录摩托压弯通过弯道。",
    "Pottery character motion": "陶艺人物动作",
    "A detailed cinematic portrait begins from a medium view and gradually moves into a close facial framing of a beautiful young woman shaping clay on a pottery wheel in a bright ceramic workshop with sunlit shelves, bowls, and hanging tools. The person is the dominant subject in the frame, styled with a tied-back apron, delicate earrings, rolled sleeves, and a simple pendant, and shown with premium skin detail, expressive eyes, subtle brow and cheek motion, anatomically convincing hands, and rich costume texture. Her hands guide the spinning clay in one smooth controlled motion as her expression moves from serene focus into a soft smile. Her gaze starts on the camera, follows the clay, briefly rises toward the window light, and returns to the lens while her head inclines naturally with the wheel.":
      "细腻的电影感人像从中景开始，逐渐推进到面部近景：一位年轻女子在明亮陶艺工坊中使用拉坯机塑形黏土，周围有阳光照亮的架子、碗和悬挂工具。人物是画面主导主体，穿系带围裙，佩戴精致耳环、挽起袖口和简洁吊坠；皮肤细节高级，眼神富有表现力，眉眼和脸颊有细微运动，手部结构可信，服装纹理丰富。她的双手以平滑可控的动作引导旋转黏土，表情从安静专注转为柔和微笑。视线先看向镜头，随后跟随黏土，短暂望向窗边光线，再回到镜头，头部随拉坯机自然倾斜。",
    "Piano performance": "钢琴演奏",
    "A detailed cinematic portrait begins from a medium view and gradually moves into a close facial framing of a beautiful young woman playing a grand piano in a luminous marble music hall with tall windows, gold sconces, flowing curtains, polished floors, and refined floral arrangements. Styled with pearl earrings, a delicate crystal hairpin, and a layered silver necklace above an elegant satin gown. Subject dominates; sharp face, open eyes, subtle micro-expressions, correct visible hands. Both hands stay clearly visible on the piano keys, and every finger movement is elegant, natural, and easy to read as she plays a calm melodic phrase; her head gives a subtle natural sway in time with the music while the smile slowly grows warmer.":
      "细腻的电影感人像从中景开始，逐渐推进到面部近景：一位年轻女子在明亮的大理石音乐厅演奏三角钢琴，厅内有高窗、金色壁灯、飘动窗帘、抛光地面和精致花艺。她佩戴珍珠耳环、细致水晶发簪，以及搭配优雅缎面礼服的层叠银色项链。主体占据主导，面部清晰、眼睛睁开、微表情细腻，双手可见且结构正确。双手始终清楚地停留在琴键上，每个手指动作优雅自然、易于辨认；演奏平静旋律时，头部随音乐轻微自然摆动，笑容逐渐变得温暖。",
    "Robot boxing match": "机器人格斗赛",
    "An elegant medium-close shot centers a shiba inu and a chrome boxing robot inside a palace-inspired championship ring with carved ivory columns, bright gold trim, glossy stone steps, and sweeping crystal chandeliers. The shiba inu wears an embroidered brocade boxing robe, a jeweled waist sash, and refined round goggles, and both fighters wear premium boxing gloves; robot has exposed polished mechanical body. Bright luxury arena; fighters dominate frame; slow readable boxing. steady camera. Controlled footwork and visible punches, with brief pauses after each exchange.":
      "优雅的中近景将柴犬和铬合金拳击机器人置于宫殿风格冠军拳台中央，周围有象牙色雕花立柱、明亮金色饰边、光滑石阶和大型水晶吊灯。柴犬穿刺绣锦缎拳击袍，系宝石腰带，戴精致圆形护目镜；两位选手都戴高级拳击手套，机器人露出抛光机械身体。明亮奢华的竞技场中，拳手占据画面主导，拳击动作缓慢且易读。稳定镜头展示受控步伐和清晰出拳，每次交锋后有短暂停顿。",
    "Two-person embrace": "双人拥抱",
    "A cinematic shot shows two young adults meeting again on a quiet train platform in warm sunset light with drifting steam and long shadows. Subject fills frame; premium face/detail, correct hands and posture. medium shot. They pause in disbelief, step closer, and embrace tightly; the camera then pushes into a close-up of their tearful relieved faces.":
      "电影感镜头展示两个年轻人在安静火车站台重逢，温暖夕阳、飘散蒸汽和长长阴影环绕四周。主体充满画面，面部与细节高级，手部和姿态正确。中景中，他们难以置信地停顿，随后走近并紧紧拥抱；镜头接着推进到近景，呈现他们含泪而释然的脸。",
    "Background transformation": "背景变换",
    "Object addition": "添加物体",
    "Character replacement": "角色替换",
    "Subject replacement": "主体替换",
    "Stylized scene": "风格化场景",
    "Compositional winter edit": "冬季组合编辑",
    "Action and expression": "动作与表情",
    "Compositional accessory edit": "配饰组合编辑",
    "Object removal": "移除物体",
    "Replace the background with a campfire.": "将背景替换为篝火。",
    "Add a row of colorful balloons.": "添加一排彩色气球。",
    "Change the boy to a girl with black shirt.": "将男孩改为穿黑色衬衫的女孩。",
    "Change the dog to a cat.": "将狗改为猫。",
    "Change the style to watercolor painting, soft colors, natural and dreamy.":
      "将风格改为水彩画，色彩柔和、自然且梦幻。",
    "Make the car a shiny red color and add a snowy street background.":
      "将汽车改为闪亮的红色，并添加雪天街道背景。",
    "Have the woman raise her right hand to gently brush her hair, slightly turn her body to the right, soften her expression, and shift her gaze to the right.":
      "让女子抬起右手轻轻拂过头发，身体微微向右转，表情变得柔和，并将视线移向右侧。",
    "Add a scarf around her neck and replace the background with a snowy park.":
      "在她脖子上添加一条围巾，并将背景替换为雪中公园。",
    "Remove face stickers.": "移除脸上的贴纸。",
    "Source video": "源视频",
    "Hair replacement": "发型替换",
    "Floral headband": "花朵发带",
    "Castle background": "城堡背景",
    "Hand wave": "挥手动作",
    "Replace short straight hair with French curly hair.":
      "将短直发替换为法式卷发。",
    "Add a floral headband with red and white flowers to her hair.":
      "在她头发上添加带有红白花朵的花朵发带。",
    "Change the background to a fairytale castle by a lake.":
      "将背景改为湖边的童话城堡。",
    "Make her raise one hand to wave slowly.": "让她抬起一只手缓慢挥动。",
    "4x4 grid navigation, route 1": "4x4 网格导航，路线 1",
    "5x5 grid navigation, route 1": "5x5 网格导航，路线 1",
    "6x6 grid navigation, route 1": "6x6 网格导航，路线 1",
    "4x4 grid navigation, route 2": "4x4 网格导航，路线 2",
    "5x5 grid navigation, route 2": "5x5 网格导航，路线 2",
    "6x6 grid navigation, route 2": "6x6 网格导航，路线 2",
    "Describe the key elements of the input maze image (layout, white path, black walls, blue star, red flag, and overall background), then generate a 2D animation. The blue star should slide smoothly along the white path, stop exactly on the red flag, and then acquire a trophy. Ensure the blue star never crosses or enters the black maze walls. Keep the camera as a static top-down view showing the entire maze.":
      "先描述输入迷宫图像的关键元素（布局、白色路径、黑色墙体、蓝色星星、红色旗帜和整体背景），再生成一个 2D 动画。蓝色星星应沿白色路径平滑移动，准确停在红旗上，然后获得奖杯。确保蓝色星星不会穿过或进入黑色迷宫墙体。镜头保持静态俯视视角，展示完整迷宫。",
    "VQA question": "VQA 问题",
    "Short caption": "短描述",
    "Long caption": "长描述",
    "How many times did the person launch objects on the table?": "这个人把桌上的物体弹起了几次？",
    "The person makes sets of repeated actions. How many distinct repeated actions did the person do?":
      "这个人做了几组重复动作。他做了几种不同的重复动作？",
    "In which direction does the purple sphere move in the video?": "视频中紫色球体朝哪个方向移动？",
    "What is the unrealistic phenomenon displayed in the video?": "视频中展示了哪种不现实现象？",
    "Options:": "选项：",
    "(A) Down and to the right.": "(A) 向下并向右。",
    "(B) Up and to the left.": "(B) 向上并向左。",
    "(C) Up and to the right.": "(C) 向上并向右。",
    "(D) The object is stationary.": "(D) 物体保持静止。",
    "(A) The man can manipulate time via phone.": "(A) 男子可以通过手机操控时间。",
    "(B) Man grabs an object through a phone screen.": "(B) 男子隔着手机屏幕抓取物体。",
    "(C) Chocolate transforms into different objects.": "(C) 巧克力变成不同物体。",
    "(D) Visible means of propulsion enables flight.": "(D) 可见推进装置实现飞行。",
    "Offer a succinct account of the culinary process shown in this video.":
      "请简洁描述视频中展示的烹饪过程。",
    "Provide a detailed description of the given video, capturing its key moments.":
      "请详细描述给定视频，并涵盖其中的关键时刻。",
    "Add tomato puree and mix it well with chicken pieces.":
      "加入番茄泥，并与鸡肉块充分搅拌均匀。",
    "In a sunlit meadow, a small tortoiseshell butterfly rests on a purple flower. A bee, with black and yellow stripes, lands on the same flower. The butterfly flaps its wings gently, while the bee busies itself, collecting nectar. The flower sways slightly in the breeze. The butterfly then takes off, and the bee follows, both heading to the next flower. The scene is a vivid display of insect interaction in a natural setting, with the colors of the butterfly and the bee contrasting against the green background of the meadow. The video captures this peaceful moment in a short 6-second duration.":
      "在阳光照耀的草地上，一只小型蛱蝶停在紫色花朵上。一只有黑黄条纹的蜜蜂落在同一朵花上。蝴蝶轻轻扇动翅膀，蜜蜂则忙着采集花蜜。花朵在微风中轻微摇曳。随后蝴蝶起飞，蜜蜂也跟随离开，二者一同飞向下一朵花。这个场景生动展示了自然环境中的昆虫互动，蝴蝶和蜜蜂的色彩与草地绿色背景形成对比。视频在短短 6 秒中捕捉了这一宁静瞬间。",
    "Is the largest segment greater than sum of all the other segments?":
      "最大扇区是否大于其他所有扇区之和？",
    "Yes, the largest segment in the pie chart is the blue one, which is the most populous segment.":
      "是的，饼图中最大的扇区是蓝色扇区，也是占比最高的扇区。",
    "What percentage of respondents want better border security?":
      "有多少比例的受访者希望改善边境安全？",
    "What is the license plate number of the car?": "这辆车的车牌号是什么？",
    "The license plate number of the car is BX62 BFY.": "这辆车的车牌号是 BX62 BFY。",
    "According to the proprietary market research data, how much was spent on promotional meetings and events during 1998?":
      "根据专有市场研究数据，1998 年在促销会议和活动上的支出是多少？",
    "According to the data from the proprietary market research, the total amount spent on the promotional meetings and events during 1998 was approximately $1.3 billion.":
      "根据专有市场研究数据，1998 年在促销会议和活动上的总支出约为 13 亿美元。",
    "What is the appearance of the Colosseum in Rome, Italy?":
      "意大利罗马斗兽场的外观是什么样的？",
    "The Colosseum in Rome, Italy is a magnificent ancient amphitheater made of stone and concrete. It is characterized by its large, arched openings and its semi-circular shape. The Colosseum has been partially restored, and its original color has faded, but the architectural details, like the columns and the semi-circular arches, are still visible. The lighting in the image highlights the grandeur and historical significance of the Colosseum, making it stand out against the backdrop of the evening sky.":
      "意大利罗马斗兽场是一座宏伟的古代圆形剧场，由石材和混凝土建成。它以巨大的拱形开口和半圆形结构为特征。斗兽场已经经过部分修复，原有色彩有所褪去，但柱体、半圆拱等建筑细节仍清晰可见。图像中的光线凸显了斗兽场的恢宏气势和历史意义，使其在傍晚天空背景下格外醒目。",
    "How does a total solar eclipse look like from Earth?": "从地球上看，日全食是什么样的？",
    "A total solar eclipse looks like a dark circle with a bright, white outer edge. This is a result of the Earth's rotation and the Earth's shadow, which partially obscures the sun's light. The bright white edge of the eclipse is caused by the sun's high energy and its interaction with the Earth's atmosphere, while the dark part of the eclipse is due to the Earth's shadow and the surrounding air currents. The solar eclipse's shape, with its bright white edge and dark center, is similar to the shape of a full moon or a dark disk. It is a natural phenomenon that occurs in the atmosphere of the Earth and is an important part of the solar system.":
      "从地球上看，日全食像一个带有明亮白色外缘的黑色圆盘。黑暗部分来自月球遮挡太阳光，而明亮边缘通常对应日冕等太阳外层结构。它呈现出明亮外缘和暗中心的形态，是一种重要的天文现象。",
    "background_change": "背景变换",
    "color_alter": "颜色修改",
    "material_alter": "材质修改",
    "motion_change": "运动修改",
    "ps_human": "人物编辑",
    "style_change": "风格修改",
    "subject-add": "主体添加",
    "subject-remove": "主体移除",
    "subject-replace": "主体替换",
    "text_change": "文本修改",
    "tone_transfer": "色调迁移",
    "Action Sequence": "动作序列",
    "Action Prediction": "动作预测",
    "Action Antonym": "动作反义",
    "Fine-grained Action": "细粒度动作",
    "Unexpected Action": "异常动作",
    "Object Existence": "物体存在",
    "Object Interaction": "物体交互",
    "Object Shuffle": "物体重排",
    "Moving Direction": "运动方向",
    "Action Localization": "动作定位",
    "Scene Transition": "场景转场",
    "Action Count": "动作计数",
    "Moving Count": "运动计数",
    "Moving Attribute": "运动属性",
    "State Change": "状态变化",
    "Character Order": "角色顺序",
    "Episodic Reasoning": "情节推理",
    "Egocentric Navigation": "第一视角导航",
    "Counterfactual Inference": "反事实推理",
    "© 2026 Lance. All rights reserved.": "© 2026 Lance. 保留所有权利。",
  },
};

const i18nAttributes = {
  zh: {
    "Primary navigation": "主导航",
    "Lance homepage": "Lance 主页",
    "Video sections": "视频章节",
    "Image sections": "图像章节",
    "Benchmark sections": "评测章节",
    "More sections": "更多章节",
    "Research note": "研究说明",
    "Select language": "选择语言",
    "Language options": "语言选项",
    "Representative Lance outputs": "Lance 代表性输出",
    "Jump to Text-to-Video examples": "跳转到文本到视频示例",
    "Jump to Image-to-Video examples": "跳转到图像到视频示例",
    "Jump to Video Editing examples": "跳转到视频编辑示例",
    "Jump to Intelligent Video Generation examples": "跳转到智能视频生成示例",
    "Surfing red panda text-to-video preview": "冲浪小熊猫文本到视频预览",
    "Dog to cat subject replacement video editing preview": "狗替换为猫的视频编辑预览",
    "6x6 maze planning video generation preview": "6x6 迷宫规划视频生成预览",
    "Snow leopard standing on a glacier before leaping":
      "站在冰川上准备跳跃的雪豹",
    "Emperor penguin standing beside calm icy water":
      "站在平静冰水旁的帝企鹅",
    "Forest elf girl surrounded by fireflies": "萤火虫环绕的森林精灵少女",
    "Full-body portrait of a woman in a simple modern room":
      "现代简洁房间中的女子全身人像",
    "Ginger cat sleeping on a sunlit wooden windowsill":
      "阳光木质窗台上熟睡的橘猫",
    "Waterfall and rainbow in a lush canyon": "葱郁峡谷中的瀑布和彩虹",
    "Text-to-Image": "文本到图像",
    "Image editing examples": "图像编辑示例",
    "Pie chart used for segment comparison reasoning": "用于扇区比较推理的饼图",
    "Survey chart about border security priorities": "关于边境安全优先级的调查图表",
    "Car image used for license plate recognition": "用于车牌识别的汽车图像",
    "Market research chart for promotional meeting and event spending":
      "关于促销会议和活动支出的市场研究图表",
    "Colosseum image for appearance description": "用于外观描述的斗兽场图像",
    "Total solar eclipse image for visual knowledge answering":
      "用于视觉知识问答的日全食图像",
    "Lance Framework": "Lance 框架",
    "Radar chart comparing Lance with image generation, editing, and video generation baselines":
      "Lance 与图像生成、编辑和视频生成基线的雷达图对比",
    "GEdit-Bench abbreviation definitions": "GEdit-Bench 缩写定义",
    "MVBench abbreviation definitions": "MVBench 缩写定义",
    "Copy citation": "复制引用",
    "Citation copied": "引用已复制",
    "Copy failed": "复制失败",
    "Close preview": "关闭预览",
    "System prompt": "系统提示词",
    "Snow leopard leap": "雪豹跳跃",
    "Penguin dive": "企鹅入水",
    "Firefly forest turn": "萤火森林转身",
    "Hair-smoothing portrait": "拂发人像",
    "Sleeping cat ambience": "熟睡猫咪氛围",
    "Rainbow waterfall motion": "彩虹瀑布动态",
    "Background transformation": "背景变换",
    "Object addition": "添加物体",
    "Character replacement": "角色替换",
    "Subject replacement": "主体替换",
    "Stylized scene": "风格化场景",
    "Compositional winter edit": "冬季组合编辑",
    "Action and expression": "动作与表情",
    "Compositional accessory edit": "配饰组合编辑",
    "Object removal": "移除物体",
    "Hair replacement": "发型替换",
    "Floral headband": "花朵发带",
    "Castle background": "城堡背景",
    "Hand wave": "挥手动作",
  },
};

function normalizeLanguage(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  return null;
}

function normalizeI18nText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function replaceWithOriginalSpacing(original, replacement) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return `${leading}${replacement}${trailing}`;
}

function t(key, values = {}) {
  const messages = i18nMessages[currentLanguage] || i18nMessages.en;
  const fallback = i18nMessages.en[key] || key;
  let message = messages[key] || fallback;

  Object.entries(values).forEach(([name, value]) => {
    message = message.replaceAll(`{${name}}`, value);
  });

  return message;
}

function translatePlainText(text, language = currentLanguage) {
  if (language === DEFAULT_LANGUAGE) return text;
  const key = normalizeI18nText(text);
  return i18nText[language]?.[key] || text;
}

function safeReadLanguagePreference() {
  try {
    return normalizeLanguage(window.localStorage?.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function safeWriteLanguagePreference(language) {
  try {
    window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage can be unavailable in private or restricted browsing modes.
  }
}

function getInitialLanguage() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("lang");
  if (requested !== null) return normalizeLanguage(requested) || DEFAULT_LANGUAGE;
  return safeReadLanguagePreference() || DEFAULT_LANGUAGE;
}

function setLanguageUrl(language) {
  if (!window.history?.replaceState) return;
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  window.history.replaceState(null, "", url);
}

function getViewportAnchorSnapshot() {
  const xPoints = [
    window.innerWidth / 2,
    window.innerWidth * 0.25,
    window.innerWidth * 0.75,
  ];
  const yPoints = [
    window.innerHeight * 0.5,
    Math.max(84, window.innerHeight * 0.35),
    window.innerHeight * 0.68,
  ];
  const anchorSelector = [
    "tr",
    ".benchmark-container",
    "figure",
    ".image-grid-item",
    ".video-understanding-card",
    ".section-copy",
    ".section-title",
    "section",
  ].join(", ");

  for (const y of yPoints) {
    for (const x of xPoints) {
      const element = document.elementFromPoint(x, y);
      if (!element || element.closest(".site-nav, .language-menu, dialog")) {
        continue;
      }
      const anchor = element.closest(anchorSelector) || element;
      return { element: anchor, top: anchor.getBoundingClientRect().top };
    }
  }

  return null;
}

function restoreViewportAnchor(snapshot) {
  if (!snapshot?.element?.isConnected) return;
  const nextTop = snapshot.element.getBoundingClientRect().top;
  const delta = nextTop - snapshot.top;
  if (Math.abs(delta) < 0.5) return;

  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollBy(0, delta);
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });
}

function restoreScrollPosition(snapshot) {
  if (!snapshot) return;
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(snapshot.x, snapshot.y);
  requestAnimationFrame(() => {
    window.scrollTo(snapshot.x, snapshot.y);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
  });
}

function collectI18nTextNodes() {
  if (i18nTextNodes) return i18nTextNodes;

  i18nTextNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      const key = normalizeI18nText(node.nodeValue);
      if (!parent || !key) return NodeFilter.FILTER_REJECT;
      if (parent.closest("script, style, svg, code, pre")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest(TRANSLATION_SKIP_SELECTOR)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!i18nText.zh[key]) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    i18nTextNodes.push({
      node,
      original: node.nodeValue,
      key: normalizeI18nText(node.nodeValue),
    });
    node = walker.nextNode();
  }

  return i18nTextNodes;
}

function collectI18nAttributeTargets() {
  if (i18nAttributeTargets) return i18nAttributeTargets;

  const attributes = [
    "alt",
    "aria-label",
    "title",
    "data-preview-title",
  ];
  i18nAttributeTargets = [];

  attributes.forEach((attribute) => {
    document.querySelectorAll(`[${attribute}]`).forEach((element) => {
      const original = element.getAttribute(attribute);
      const key = normalizeI18nText(original);
      if (!key || !i18nAttributes.zh[key]) return;
      i18nAttributeTargets.push({ element, attribute, original, key });
    });
  });

  return i18nAttributeTargets;
}

function applyDocumentMetadata(language) {
  const metadata = i18nMetadata[language];
  const defaultTitle =
    "Lance: Unified Multimodal Modeling by Multi-Task Synergy";
  const defaultDescription =
    "Lance is a ByteDance research project: a 3B active-parameter native unified multimodal model for image and video understanding, generation, and editing.";
  const defaultOgDescription =
    "Lance by ByteDance is a 3B active-parameter native unified multimodal model for image and video understanding, generation, and editing.";
  const defaultTwitterDescription =
    "A ByteDance 3B active-parameter unified multimodal model for image and video understanding, generation, and editing.";
  const defaultImageAlt =
    "Lance: ByteDance unified multimodal model for image and video";

  document.title = defaultTitle;

  const description = metadata?.description || defaultDescription;
  const ogDescription = metadata?.ogDescription || defaultOgDescription;
  const twitterDescription =
    metadata?.twitterDescription || defaultTwitterDescription;
  const imageAlt = metadata?.imageAlt || defaultImageAlt;

  document
    .querySelectorAll(
      'meta[name="description"], meta[name="citation_abstract"]',
    )
    .forEach((meta) => meta.setAttribute("content", description));
  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute("content", ogDescription);
  document
    .querySelector('meta[name="twitter:description"]')
    ?.setAttribute("content", twitterDescription);
  document
    .querySelector('meta[property="og:image:alt"]')
    ?.setAttribute("content", imageAlt);
  document
    .querySelector('meta[name="twitter:image:alt"]')
    ?.setAttribute("content", imageAlt);
}

function applyLanguageToPage(language) {
  document.documentElement.lang = i18nMessages[language]?.locale || "en";
  applyDocumentMetadata(language);

  collectI18nTextNodes().forEach(({ node, original, key }) => {
    const replacement = i18nText[language]?.[key];
    node.nodeValue =
      language === DEFAULT_LANGUAGE || !replacement
        ? original
        : replaceWithOriginalSpacing(original, replacement);
  });

  collectI18nAttributeTargets().forEach(
    ({ element, attribute, original, key }) => {
      const replacement = i18nAttributes[language]?.[key];
      element.setAttribute(
        attribute,
        language === DEFAULT_LANGUAGE || !replacement ? original : replacement,
      );
    },
  );
}

function updateLanguageControls(language) {
  const switcher = document.querySelector("[data-language-switcher]");
  if (!switcher) return;

  const toggle = switcher.querySelector(".language-toggle");
  const fullLabel = switcher.querySelector(".language-label-full");
  const shortLabel = switcher.querySelector(".language-label-short");
  const menu = switcher.querySelector(".language-menu");
  const messages = i18nMessages[language] || i18nMessages.en;

  if (toggle) {
    toggle.setAttribute("aria-label", messages.selectLanguage);
  }
  if (menu) {
    menu.setAttribute("aria-label", messages.languageOptions);
  }
  if (fullLabel) fullLabel.textContent = messages.languageName;
  if (shortLabel) shortLabel.textContent = messages.languageShort;

  switcher.querySelectorAll("[data-language-option]").forEach((option) => {
    const isCurrent = option.dataset.languageOption === language;
    option.setAttribute("aria-checked", String(isCurrent));
    if (isCurrent) {
      option.setAttribute("aria-current", "true");
    } else {
      option.removeAttribute("aria-current");
    }
  });
}

function setLanguage(language, options = {}) {
  const nextLanguage = normalizeLanguage(language) || DEFAULT_LANGUAGE;
  const viewportAnchor = options.preserveViewport
    ? getViewportAnchorSnapshot()
    : null;
  currentLanguage = SUPPORTED_LANGUAGES.has(nextLanguage)
    ? nextLanguage
    : DEFAULT_LANGUAGE;

  applyLanguageToPage(currentLanguage);
  updateLanguageControls(currentLanguage);

  if (options.persist !== false) {
    safeWriteLanguagePreference(currentLanguage);
  }
  if (options.updateUrl) {
    setLanguageUrl(currentLanguage);
  }

  document.dispatchEvent(
    new CustomEvent("lance:languagechange", {
      detail: { language: currentLanguage },
    }),
  );

  if (viewportAnchor) {
    restoreViewportAnchor(viewportAnchor);
    requestAnimationFrame(() => restoreViewportAnchor(viewportAnchor));
  }
}

function initLanguageSwitcher() {
  const switcher = document.querySelector("[data-language-switcher]");
  const toggle = switcher?.querySelector(".language-toggle");
  const menu = switcher?.querySelector(".language-menu");
  const options = Array.from(
    switcher?.querySelectorAll("[data-language-option]") || [],
  );

  setLanguage(getInitialLanguage(), { persist: true, updateUrl: false });

  if (!switcher || !toggle || !menu || !options.length) return;

  const preventMouseFocusScroll = (event) => {
    if (event.button === 0) {
      event.preventDefault();
    }
  };

  const closeMenu = () => {
    switcher.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  const openMenu = () => {
    switcher.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  };

  const toggleMenu = () => {
    if (switcher.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const selectOption = (option) => {
    setLanguage(option.dataset.languageOption, {
      persist: true,
      updateUrl: true,
      preserveViewport: true,
    });
    closeMenu();
    toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener("mousedown", preventMouseFocusScroll);
  toggle.addEventListener("click", () => {
    const scrollSnapshot = { x: window.scrollX, y: window.scrollY };
    toggleMenu();
    restoreScrollPosition(scrollSnapshot);
  });
  toggle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const scrollSnapshot = { x: window.scrollX, y: window.scrollY };
    toggleMenu();
    restoreScrollPosition(scrollSnapshot);
  });

  options.forEach((option) => {
    option.addEventListener("mousedown", preventMouseFocusScroll);
    option.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectOption(option);
    });
    option.addEventListener("click", () => {
      selectOption(option);
    });
  });

  document.addEventListener("click", (event) => {
    if (!switcher.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function hydrateMediaElement(element) {
  if (!element) return;

  const source = element.dataset?.src;
  const poster = element.dataset?.poster;

  if (poster && !element.getAttribute("poster")) {
    element.poster = poster;
    element.removeAttribute("data-poster");
  }

  if (source && !element.getAttribute("src")) {
    element.src = source;
    element.removeAttribute("data-src");
  }
}

function initLazyMedia() {
  const lazyMedia = Array.from(
    document.querySelectorAll("video[data-src], video[data-poster]"),
  );
  if (!lazyMedia.length) return;

  if (!("IntersectionObserver" in window)) {
    lazyMedia.forEach(hydrateMediaElement);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        hydrateMediaElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "400px 0px",
      threshold: 0.01,
    },
  );

  lazyMedia.forEach((element) => observer.observe(element));
}

function initNavMore() {
  const navMoreItems = Array.from(document.querySelectorAll(".nav-more"));
  if (!navMoreItems.length) return;

  navMoreItems.forEach((item) => {
    item.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        item.open = false;
      });
    });
  });

  document.addEventListener("click", (event) => {
    navMoreItems.forEach((item) => {
      if (!item.contains(event.target)) item.open = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    navMoreItems.forEach((item) => {
      item.open = false;
    });
  });
}

function initVideoLightbox() {
  const dialog = document.querySelector("#video-lightbox");
  const panel = dialog?.querySelector(".video-lightbox-panel");
  const media = dialog?.querySelector(".video-lightbox-media");
  const image = dialog?.querySelector(".image-lightbox-media");
  const closeButton = dialog?.querySelector(".video-lightbox-close");
  const title = dialog?.querySelector("#video-lightbox-title");
  const kicker = dialog?.querySelector("#video-lightbox-kicker");
  const caption = dialog?.querySelector(".video-lightbox-caption");
  if (
    !dialog ||
    !panel ||
    !media ||
    !image ||
    !closeButton ||
    !title ||
    !kicker ||
    !caption
  ) {
    return null;
  }

  const details = document.createElement("div");
  details.className = "video-lightbox-details";
  details.hidden = true;
  caption.append(details);

  let returnFocusTo = null;
  let shouldRestoreFocus = false;
  let isClosing = false;
  let lockedScroll = null;
  let lockedBodyStyles = null;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setLightboxAspect = (width, height) => {
    if (!width || !height) return;
    dialog.style.setProperty("--media-aspect", `${width} / ${height}`);
  };

  media.addEventListener("loadedmetadata", () => {
    setLightboxAspect(media.videoWidth, media.videoHeight);
  });

  image.addEventListener("load", () => {
    setLightboxAspect(image.naturalWidth, image.naturalHeight);
  });

  const showVideo = () => {
    dialog.classList.remove("is-image-mode");
    media.hidden = false;
    image.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
  };

  const showImage = () => {
    dialog.classList.add("is-image-mode");
    media.pause();
    media.hidden = true;
    image.hidden = false;
    media.removeAttribute("src");
    media.removeAttribute("poster");
    media.load();
  };

  const getOriginRect = (origin) => {
    if (!origin?.isConnected) return null;
    const rect = origin.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    if (
      rect.right < 0 ||
      rect.bottom < 0 ||
      rect.left > window.innerWidth ||
      rect.top > window.innerHeight
    ) {
      return null;
    }
    return rect;
  };

  const animatePanelFromOrigin = (origin, reverse = false) => {
    if (motionQuery.matches || typeof panel.animate !== "function") {
      return Promise.resolve();
    }

    const originRect = getOriginRect(origin);
    const panelRect = panel.getBoundingClientRect();
    if (!originRect || !panelRect.width || !panelRect.height) {
      return Promise.resolve();
    }

    panel.getAnimations().forEach((animation) => animation.cancel());

    const scale = Math.min(
      originRect.width / panelRect.width,
      originRect.height / panelRect.height,
    );
    const scaledWidth = panelRect.width * scale;
    const scaledHeight = panelRect.height * scale;
    const translateX =
      originRect.left + (originRect.width - scaledWidth) / 2 - panelRect.left;
    const translateY =
      originRect.top + (originRect.height - scaledHeight) / 2 - panelRect.top;
    const sharedOrigin = {
      borderRadius: "6px",
      opacity: 0.72,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: "top left",
    };
    const expanded = {
      borderRadius: "8px",
      opacity: 1,
      transform: "translate(0, 0) scale(1)",
      transformOrigin: "top left",
    };

    const animation = panel.animate(reverse ? [expanded, sharedOrigin] : [sharedOrigin, expanded], {
      duration: reverse ? 190 : 240,
      easing: reverse ? "cubic-bezier(0.4, 0, 1, 1)" : "cubic-bezier(0.16, 1, 0.3, 1)",
    });

    return animation.finished.catch(() => {});
  };

  const lockPageScroll = (scrollSnapshot = null) => {
    if (lockedScroll) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    lockedScroll = scrollSnapshot || {
      x: window.scrollX,
      y: window.scrollY,
    };
    lockedBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScroll.y}px`;
    document.body.style.left = `-${lockedScroll.x}px`;
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  const unlockPageScroll = () => {
    if (!lockedScroll || !lockedBodyStyles) return;

    const { x, y } = lockedScroll;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;

    document.body.style.position = lockedBodyStyles.position;
    document.body.style.top = lockedBodyStyles.top;
    document.body.style.left = lockedBodyStyles.left;
    document.body.style.right = lockedBodyStyles.right;
    document.body.style.width = lockedBodyStyles.width;
    document.body.style.paddingRight = lockedBodyStyles.paddingRight;
    lockedScroll = null;
    lockedBodyStyles = null;

    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(x, y);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
  };

  const openDialog = (origin, scrollSnapshot = null) => {
    if (dialog.open) return;
    lockPageScroll(scrollSnapshot);
    dialog.showModal();
    requestAnimationFrame(() => {
      animatePanelFromOrigin(origin);
    });
  };

  const suppressReturnHighlight = (target) => {
    if (!target?.isConnected) return;

    target.classList.add("is-returning");
    if (document.activeElement === target) {
      target.blur();
    }

    let timer = 0;
    const clearSuppression = () => {
      window.clearTimeout(timer);
      target.classList.remove("is-returning");
      target.removeEventListener("pointerleave", clearSuppression);
    };

    timer = window.setTimeout(() => {
      if (!target.matches(":hover")) {
        clearSuppression();
      }
    }, 900);
    target.addEventListener("pointerleave", clearSuppression, { once: true });
  };

  const resetLightbox = () => {
    media.pause();
    media.removeAttribute("src");
    media.removeAttribute("poster");
    media.load();
    media.hidden = false;
    image.removeAttribute("src");
    image.alt = "";
    image.hidden = true;
    dialog.classList.remove("is-image-mode");
    dialog.style.removeProperty("--media-aspect");

    if (dialog.open) {
      dialog.close();
    }
    unlockPageScroll();
    details.hidden = true;
    details.replaceChildren();
    dialog.classList.remove("has-qa-details");

    const focusTarget = returnFocusTo;
    returnFocusTo = null;

    if (shouldRestoreFocus && focusTarget?.isConnected) {
      focusTarget.focus({ preventScroll: true });
    } else {
      suppressReturnHighlight(focusTarget);
    }
    shouldRestoreFocus = false;
  };

  const closeLightbox = async () => {
    if (isClosing) return;
    isClosing = true;
    await animatePanelFromOrigin(returnFocusTo, true);
    resetLightbox();
    isClosing = false;
  };

  closeButton.addEventListener("click", closeLightbox);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeLightbox();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeLightbox();
    }
  });

  dialog.addEventListener("close", () => {
    media.pause();
  });

  const renderDetails = (detailItems = []) => {
    details.replaceChildren();

    const validItems = detailItems.filter((item) => item?.value);
    if (!validItems.length) {
      details.hidden = true;
      dialog.classList.remove("has-qa-details");
      return;
    }

    validItems.forEach((item) => {
      const block = document.createElement("div");
      block.className = "video-lightbox-detail-block";

      const label = document.createElement("span");
      label.textContent = item.label;

      const value = document.createElement("p");
      value.textContent = item.value;

      block.append(label, value);
      details.append(block);
    });

    details.hidden = false;
    dialog.classList.add("has-qa-details");
  };

  const openVideo = (item, options = {}) => {
    const source = item.querySelector("video");
    if (!source) return;
    hydrateMediaElement(source);

    document.dispatchEvent(new CustomEvent("lance:pause-grid-videos"));
    showVideo();

    const label =
      item.dataset.previewTitle ||
      item.querySelector(".video-prompt")?.textContent?.trim() ||
      t("videoPreview");
    const sectionTitle =
      item.closest(".section")?.querySelector(".section-title")?.textContent?.trim() ||
      t("demo");
    const origin = options.origin || item;
    const fullCaption = getReadableText(item.querySelector(".video-full-caption"));
    const promptLabel =
      item.dataset.promptLabel ||
      item.closest(".section")?.dataset.promptLabel ||
      "Prompt";
    const detailItems = fullCaption
      ? [...(options.details || []), { label: promptLabel, value: fullCaption }]
      : options.details;

    returnFocusTo = origin;
    shouldRestoreFocus = Boolean(options.restoreFocus);
    title.textContent = options.title || label;
    kicker.textContent = options.kicker || sectionTitle;
    renderDetails(detailItems);
    media.src =
      source.currentSrc || source.getAttribute("src") || source.dataset.src || "";
    media.poster = source.getAttribute("poster") || source.dataset.poster || "";
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    setLightboxAspect(source.videoWidth, source.videoHeight);

    openDialog(origin, options.scrollSnapshot);

    media.play().catch(() => {});
  };

  const openImage = (source, options = {}) => {
    if (!source) return;

    document.dispatchEvent(new CustomEvent("lance:pause-grid-videos"));
    showImage();

    const label = source.getAttribute("alt") || t("figurePreview");
    const sectionTitle =
      source.closest(".section")?.querySelector(".section-title")?.textContent?.trim() ||
      t("figure");
    const width = source.naturalWidth || Number(source.getAttribute("width"));
    const height = source.naturalHeight || Number(source.getAttribute("height"));
    const origin = options.origin || source;

    returnFocusTo = origin;
    shouldRestoreFocus = Boolean(options.restoreFocus);
    title.textContent = options.title || label;
    kicker.textContent = options.kicker || sectionTitle;
    renderDetails(options.details);
    image.src = source.currentSrc || source.src;
    image.alt = label;
    setLightboxAspect(width, height);

    openDialog(origin, options.scrollSnapshot);
  };

  return { openVideo, openImage };
}

function initImageLightbox(openImage) {
  const images = Array.from(
    document.querySelectorAll(
      [
        ".scroll-zoom-img",
        ".image-editing-img",
        ".framework-img",
        ".benchmark-radar-img",
        "#image-to-video .i2v-input-panel img",
      ].join(", "),
    ),
  );
  if (!images.length || !openImage) return;

  images.forEach((image) => {
    const label = image.getAttribute("alt") || "figure";
    let pointerScrollSnapshot = null;

    image.classList.add("zoomable-media");
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Open ${label} figure`);

    image.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    image.addEventListener("click", () => {
      openImage(image, {
        restoreFocus: false,
        scrollSnapshot: pointerScrollSnapshot,
      });
      pointerScrollSnapshot = null;
    });
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openImage(image, { restoreFocus: true });
      }
    });
  });
}

function getReadableText(element) {
  if (!element) return "";

  const lineBreakMarker = "\uE000";
  const clone = element.cloneNode(true);
  clone.querySelectorAll("br").forEach((breakNode) => {
    breakNode.replaceWith(document.createTextNode(` ${lineBreakMarker} `));
  });

  return clone.textContent
    .replace(/\s+/g, " ")
    .replace(new RegExp(`\\s*${lineBreakMarker}\\s*`, "g"), "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getAnswerText(element) {
  if (!element) return "";

  const clone = element.cloneNode(true);
  clone.querySelectorAll("span").forEach((label) => label.remove());
  return getReadableText(clone);
}

function initUnderstandingCaseLightboxes(openVideo, openImage) {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const videoCards = Array.from(
    document.querySelectorAll(".video-understanding-card"),
  );
  const imageCards = Array.from(document.querySelectorAll(".understanding-card"));

  const getVideoDetails = (card) => [
    {
      label: "Question",
      value: getReadableText(card.querySelector(".video-understanding-primary")),
    },
    {
      label: "Response",
      value: getReadableText(card.querySelector(".video-understanding-answer")),
    },
  ];

  const getImageDetails = (card) => [
    {
      label: "Question",
      value: getReadableText(card.querySelector(".understanding-question")),
    },
    {
      label: "Response",
      value: getAnswerText(card.querySelector(".understanding-answer")),
    },
  ];

  const pauseVideoCard = (card) => {
    const video = card.querySelector("video");
    if (!video) return;
    video.pause();
    card.classList.remove("is-active");
  };

  const pauseAllVideoCards = (exceptCard = null) => {
    videoCards.forEach((card) => {
      if (card !== exceptCard) pauseVideoCard(card);
    });
  };

  const playVideoCard = (card) => {
    if (motionQuery.matches || card.classList.contains("is-returning")) return;

    const video = card.querySelector("video");
    if (!video) return;

    pauseAllVideoCards(card);
    document.dispatchEvent(new CustomEvent("lance:pause-grid-videos"));
    hydrateMediaElement(video);
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const promise = video.play();
    card.classList.add("is-active");

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        card.classList.remove("is-active");
      });
    }
  };

  const openVideoCard = (card, options = {}) => {
    if (!openVideo) return;

    const details = getVideoDetails(card);
    const prompt =
      card.querySelector(".video-prompt")?.textContent?.trim() ||
      t("videoUnderstanding");

    openVideo(card, {
      ...options,
      origin: card,
      title: prompt,
      kicker: t("videoUnderstanding"),
      details,
    });
  };

  const openImageCard = (card, options = {}) => {
    if (!openImage) return;

    const image = card.querySelector(".understanding-img");
    if (!image) return;

    const details = getImageDetails(card);

    openImage(image, {
      ...options,
      origin: card,
      title: t("imageUnderstandingCase"),
      kicker: t("imageUnderstanding"),
      details,
    });
  };

  const refreshCardLabels = () => {
    videoCards.forEach((card) => {
      const details = getVideoDetails(card);
      const question = details[0]?.value || t("videoUnderstandingCase");
      card.setAttribute("aria-label", t("openItem", { label: question }));
    });

    imageCards.forEach((card) => {
      const details = getImageDetails(card);
      const question = details[0]?.value || t("imageUnderstandingCase");
      card.setAttribute("aria-label", t("openItem", { label: question }));
    });
  };

  videoCards.forEach((card) => {
    const video = card.querySelector("video");
    const details = getVideoDetails(card);
    const question = details[0]?.value || t("videoUnderstandingCase");
    let pointerScrollSnapshot = null;

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", t("openItem", { label: question }));

    if (video) {
      video.autoplay = false;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      video.pause();
    }

    card.addEventListener("mouseenter", () => playVideoCard(card));
    card.addEventListener("focusin", () => playVideoCard(card));
    card.addEventListener("mouseleave", () => pauseVideoCard(card));
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget)) {
        pauseVideoCard(card);
      }
    });
    card.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    card.addEventListener("click", () => {
      openVideoCard(card, {
        restoreFocus: false,
        scrollSnapshot: pointerScrollSnapshot,
      });
      pointerScrollSnapshot = null;
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openVideoCard(card, { restoreFocus: true });
      }
    });
  });

  imageCards.forEach((card) => {
    const details = getImageDetails(card);
    const question = details[0]?.value || t("imageUnderstandingCase");
    let pointerScrollSnapshot = null;

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", t("openItem", { label: question }));

    card.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    card.addEventListener("click", () => {
      openImageCard(card, {
        restoreFocus: false,
        scrollSnapshot: pointerScrollSnapshot,
      });
      pointerScrollSnapshot = null;
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openImageCard(card, { restoreFocus: true });
      }
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAllVideoCards();
    }
  });

  document.addEventListener("lance:pause-grid-videos", () => {
    pauseAllVideoCards();
  });

  document.addEventListener("lance:languagechange", refreshCardLabels);
}

function initVideoPreviews(openPreview) {
  const items = Array.from(
    document.querySelectorAll(".video-item:not(.video-understanding-media)"),
  );
  if (!items.length) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverFallbackQuery = window.matchMedia("(hover: hover)");
  const sequenceGroups = Array.from(
    document.querySelectorAll("#multi-round-editing .video-flow"),
  );
  const sequenceItems = new Set(
    sequenceGroups.flatMap((group) => Array.from(group.querySelectorAll(".video-item"))),
  );

  const setActiveState = (item, active) => {
    item.classList.toggle("is-active", active);
  };

  const pauseItem = (item) => {
    const video = item.querySelector("video");
    if (!video) return;
    video.pause();
    setActiveState(item, false);
  };

  const pauseAll = (exceptItem = null) => {
    items.forEach((item) => {
      if (item === exceptItem) return;
      pauseItem(item);
    });
  };

  const playItem = (item) => {
    if (item.classList.contains("is-returning")) return;

    const video = item.querySelector("video");
    if (!video) return;

    pauseAll(item);
    hydrateMediaElement(video);
    const promise = video.play();
    setActiveState(item, true);

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        setActiveState(item, false);
      });
    }
  };

  const pauseSequence = (group) => {
    group.querySelectorAll(".video-item").forEach((item) => pauseItem(item));
  };

  const playSequence = (group, pointerType = "mouse") => {
    if (motionQuery.matches || pointerType !== "mouse") return;

    const groupItems = Array.from(group.querySelectorAll(".video-item"));
    pauseAll();

    groupItems.forEach((item) => {
      if (item.classList.contains("is-returning")) return;

      const video = item.querySelector("video");
      if (!video) return;

      hydrateMediaElement(video);
      const promise = video.play();
      setActiveState(item, true);

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          setActiveState(item, false);
        });
      }
    });
  };

  const refreshItemLabels = () => {
    items.forEach((item) => {
      const prompt = item.querySelector(".video-prompt")?.textContent?.trim();
      if (prompt) {
        item.setAttribute("aria-label", t("openPreview", { label: prompt }));
      }
    });
  };

  items.forEach((item) => {
    const video = item.querySelector("video");
    const prompt = item.querySelector(".video-prompt")?.textContent?.trim();
    let pointerScrollSnapshot = null;
    const isSequenceItem = sequenceItems.has(item);
    if (!video) return;

    item.tabIndex = 0;
    item.setAttribute("role", "button");
    if (prompt) {
      item.setAttribute("aria-label", t("openPreview", { label: prompt }));
    }

    video.autoplay = false;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.pause();

    if (!isSequenceItem) {
      item.addEventListener("mouseenter", () => {
        if (motionQuery.matches) return;
        playItem(item);
      });

      item.addEventListener("focusin", () => {
        if (motionQuery.matches) return;
        playItem(item);
      });

      item.addEventListener("mouseleave", () => {
        pauseItem(item);
      });

      item.addEventListener("focusout", () => {
        pauseItem(item);
      });
    }

    item.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    item.addEventListener("click", () => {
      if (openPreview) {
        openPreview(item, {
          restoreFocus: false,
          scrollSnapshot: pointerScrollSnapshot,
        });
        pointerScrollSnapshot = null;
      } else {
        playItem(item);
      }
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (openPreview) {
          openPreview(item, { restoreFocus: true });
        } else {
          playItem(item);
        }
      }
    });
  });

  sequenceGroups.forEach((group) => {
    if ("PointerEvent" in window) {
      group.addEventListener("pointerenter", (event) => {
        playSequence(group, event.pointerType);
      });

      group.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") {
          pauseSequence(group);
        }
      });
    } else {
      group.addEventListener("mouseenter", () => {
        if (hoverFallbackQuery.matches) playSequence(group);
      });

      group.addEventListener("mouseleave", () => {
        if (hoverFallbackQuery.matches) pauseSequence(group);
      });
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            pauseItem(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    items.forEach((item) => observer.observe(item));
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAll();
      sequenceGroups.forEach(pauseSequence);
    }
  });

  document.addEventListener("lance:pause-grid-videos", () => {
    pauseAll();
    sequenceGroups.forEach(pauseSequence);
  });

  document.addEventListener("lance:languagechange", refreshItemLabels);
}

function initShowcaseVideos() {
  const cards = Array.from(document.querySelectorAll(".showcase-card"));
  if (!cards.length) return;

  const primaryCard = document.querySelector(".showcase-card-large");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let primaryInView = true;
  let primaryAutoplayEnabled = false;

  const canAutoplayPrimary = () =>
    Boolean(primaryCard) &&
    primaryAutoplayEnabled &&
    primaryInView &&
    !document.hidden &&
    !motionQuery.matches;

  const stopCard = (card, reset = false) => {
    const video = card.querySelector(".showcase-video");
    if (!video) return;
    video.pause();
    if (reset) {
      video.currentTime = 0;
    }
    card.classList.remove("is-playing");
  };

  const stopAll = (exceptCard = null) => {
    cards.forEach((card) => {
      if (card !== exceptCard) stopCard(card);
    });
  };

  const playCard = (card, options = {}) => {
    if (motionQuery.matches) return;
    const video = card.querySelector(".showcase-video");
    if (!video) return;

    stopAll(card);
    hydrateMediaElement(video);
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    if (options.isAutoplay) {
      video.preload = "auto";
    }

    const promise = video.play();
    if (promise && typeof promise.then === "function") {
      promise
        .then(() => card.classList.add("is-playing"))
        .catch(() => card.classList.remove("is-playing"));
      return;
    }

    card.classList.add("is-playing");
  };

  const autoplayPrimary = () => {
    if (!canAutoplayPrimary()) return;
    playCard(primaryCard, { isAutoplay: true });
  };

  const syncPrimaryAutoplay = () => {
    if (canAutoplayPrimary()) {
      autoplayPrimary();
    } else if (primaryCard) {
      stopCard(primaryCard, true);
    }
  };

  cards.forEach((card) => {
    const video = card.querySelector(".showcase-video");
    if (!video) return;
    const isPrimaryCard = card === primaryCard;

    video.autoplay = isPrimaryCard;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    if (isPrimaryCard) {
      video.setAttribute("autoplay", "");
      video.preload = "auto";
    } else {
      video.removeAttribute("autoplay");
      video.preload = "none";
      video.pause();
    }

    card.addEventListener("mouseenter", () => playCard(card));
    card.addEventListener("focusin", () => playCard(card));
    card.addEventListener("mouseleave", () => {
      if (card === primaryCard && canAutoplayPrimary()) {
        autoplayPrimary();
        return;
      }
      stopCard(card);
      if (card !== primaryCard) autoplayPrimary();
    });
    card.addEventListener("focusout", () => {
      if (card === primaryCard && canAutoplayPrimary()) {
        autoplayPrimary();
        return;
      }
      stopCard(card);
      if (card !== primaryCard) autoplayPrimary();
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === primaryCard) {
            primaryInView = entry.isIntersecting;
            if (entry.isIntersecting) {
              syncPrimaryAutoplay();
            } else {
              stopCard(entry.target, true);
            }
            return;
          }

          if (!entry.isIntersecting) {
            stopCard(entry.target, true);
          }
        });
      },
      { threshold: 0.1 },
    );

    cards.forEach((card) => observer.observe(card));
  } else {
    syncPrimaryAutoplay();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAll();
    } else {
      syncPrimaryAutoplay();
    }
  });

  [motionQuery].forEach((query) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", syncPrimaryAutoplay);
    } else if (typeof query.addListener === "function") {
      query.addListener(syncPrimaryAutoplay);
    }
  });

  const enablePrimaryAutoplay = () => {
    primaryAutoplayEnabled = true;
    syncPrimaryAutoplay();
  };

  enablePrimaryAutoplay();
}

function initCitationCopy() {
  const button = document.querySelector(".copy-citation-btn");
  const citation = document.querySelector(".citation-block code");
  if (!button || !citation) return;

  const resetButton = () => {
    button.classList.remove("is-copied");
    button.setAttribute("aria-label", t("copyCitation"));
    button.title = t("copyCitation");
  };

  const copyWithFallback = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Continue to the selection-based fallback below.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  button.addEventListener("click", async () => {
    try {
      await copyWithFallback(citation.textContent.trim());
      button.classList.add("is-copied");
      button.setAttribute("aria-label", t("citationCopied"));
      button.title = t("citationCopied");
      window.setTimeout(resetButton, 1600);
    } catch {
      button.setAttribute("aria-label", t("copyFailed"));
      button.title = t("copyFailed");
      window.setTimeout(resetButton, 1600);
    }
  });

  document.addEventListener("lance:languagechange", resetButton);
}

function initMetricColumnFrames() {
  document.querySelectorAll(".metric-frame-layer").forEach((frameLayer) => {
    const table = frameLayer.querySelector(".highlight-metric-table");
    const container = frameLayer.querySelector(".benchmark-container");
    const highlightColumn = Number(frameLayer.dataset.highlightColumn || 3);
    const modelHeader = table?.querySelector("thead th:nth-child(1)");
    const paramsHeader = table?.querySelector("thead th:nth-child(2)");
    const headerCell = table?.querySelector(`thead th:nth-child(${highlightColumn})`);
    if (
      !table ||
      !container ||
      !modelHeader ||
      !paramsHeader ||
      !headerCell
    ) {
      return;
    }

    const frame = document.createElement("div");
    frame.className = "metric-column-frame";
    frame.setAttribute("aria-hidden", "true");
    frameLayer.append(frame);

    let frameRequest = null;

    const updateFrame = () => {
      if (frameRequest) return;
      frameRequest = requestAnimationFrame(() => {
        frameRequest = null;
        const modelWidth = modelHeader.getBoundingClientRect().width;
        const paramsWidth = paramsHeader.getBoundingClientRect().width;
        const highlightWidth = headerCell.getBoundingClientRect().width;
        table.style.setProperty("--summary-model-col", `${modelWidth}px`);
        table.style.setProperty("--summary-param-col", `${paramsWidth}px`);
        table.style.setProperty("--summary-highlight-col", `${highlightWidth}px`);

        const highlightRect = headerCell.getBoundingClientRect();
        const frameLayerRect = frameLayer.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        const frameInsetX = -2;
        const frameOutsetY = 18;
        const left = highlightRect.left - frameLayerRect.left + frameInsetX;
        const top = tableRect.top - frameLayerRect.top - frameOutsetY;
        const width = Math.max(highlightWidth - frameInsetX * 2, 40);
        const height = tableRect.height + frameOutsetY * 2;

        frame.style.left = `${left}px`;
        frame.style.top = `${top}px`;
        frame.style.width = `${width}px`;
        frame.style.height = `${height}px`;
      });
    };

    updateFrame();
    container.addEventListener("scroll", updateFrame, { passive: true });
    window.addEventListener("resize", updateFrame, { passive: true });
    document.addEventListener("lance:languagechange", () => {
      updateFrame();
      requestAnimationFrame(() => requestAnimationFrame(updateFrame));
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(updateFrame);
    }
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateFrame);
      observer.observe(table);
      observer.observe(container);
      observer.observe(frameLayer);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguageSwitcher();
  initLazyMedia();
  initNavMore();
  initShowcaseVideos();
  const lightbox = initVideoLightbox();
  initVideoPreviews(lightbox?.openVideo);
  initImageLightbox(lightbox?.openImage);
  initUnderstandingCaseLightboxes(lightbox?.openVideo, lightbox?.openImage);
  initCitationCopy();
  initMetricColumnFrames();
});

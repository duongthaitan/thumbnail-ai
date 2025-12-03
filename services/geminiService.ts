import { GoogleGenAI, Part } from "@google/genai";
import { ThumbnailRequest, ThumbnailStyle } from "../types";

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a lightweight model to test the connection
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: 'Test connection' }] },
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};

export const generateMagicPrompt = async (originalPrompt: string, apiKey?: string): Promise<string> => {
  const key = apiKey || process.env.API_KEY;
  if (!key) throw new Error("Missing API Key");

  const ai = new GoogleGenAI({ apiKey: key });
  
  const systemInstruction = `
    You are a World-Class Prompt Engineer for Generative AI.
    Rewrite the user's simple description into a detailed, high-quality prompt for a YouTube Thumbnail.
    
    Structure:
    [Subject Description] + [Action/Pose] + [Emotion] + [Lighting/Atmosphere] + [Camera Angle] + [Texture/Details].
    
    Rules:
    - Keep it under 150 words.
    - Use keywords: "Hyper-realistic", "4K", "Vibrant", "Trending on ArtStation".
    - Focus on high CTR (Click-Through Rate).
    - Output ONLY the prompt text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { 
        parts: [{ text: `Original: "${originalPrompt}". Rewrite it to be amazing:` }] 
      },
      config: {
        systemInstruction: systemInstruction
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || originalPrompt;
  } catch (e) {
    console.warn("Magic Prompt failed", e);
    return originalPrompt;
  }
};

export const suggestThumbnailConcept = async (mainText: string, apiKey?: string): Promise<string> => {
   const key = apiKey || process.env.API_KEY;
   if (!key) throw new Error("Missing API Key");

   const ai = new GoogleGenAI({ apiKey: key });
   const response = await ai.models.generateContent({
     model: 'gemini-2.5-flash',
     contents: {
       parts: [{ text: `Title: "${mainText}". Suggest a visual concept for a YouTube Thumbnail.` }]
     },
     config: {
       systemInstruction: "You are a YouTube Strategist. Suggest a high-CTR visual concept based on the video title. Keep it short, visual, and exciting. Output ONLY the visual description."
     }
   });
   return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

export const generateThumbnail = async (request: ThumbnailRequest): Promise<string> => {
  const apiKey = request.apiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API Key.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { mainText, subText, aspectRatio, style, userPrompt, referenceImages } = request;

  const numImages = referenceImages?.length || 0;
  const hasMainText = mainText && mainText.trim().length > 0;
  const hasSubText = subText && subText.trim().length > 0;
  
  // Logic to determine how to handle images based on count
  let imageHandlingStrategy = "";
  if (numImages === 0) {
    imageHandlingStrategy = `
    - **CHẾ ĐỘ SÁNG TẠO TỰ DO (Creative Mode)**:
      Không có ảnh tham chiếu.
      **NHIỆM VỤ**:
      1. Tự do sáng tạo nhân vật độc đáo (ưu tiên biểu cảm khuôn mặt phóng đại, thu hút).
      2. Xây dựng bối cảnh ấn tượng nhất dựa trên mô tả văn bản.
    `;
  } else if (numImages === 1) {
    imageHandlingStrategy = `
    - **CHẾ ĐỘ DIGITAL TWIN (1 ẢNH)**: 
      Ảnh đầu vào chứa NHÂN VẬT CHÍNH (hoặc Chủ thể chính).
      **NHIỆM VỤ**:
      1. **Face Lock**: Giữ nguyên 100% cấu trúc khuôn mặt và đặc điểm nhận dạng của nhân vật trong ảnh.
      2. Tách nhân vật khỏi nền cũ, đặt vào nền mới phù hợp với prompt.
      3. Thêm hiệu ứng "Pop-out": Làm nhân vật to hơn, sắc nét hơn, thêm viền sáng (Rim Light).
    `;
  } else if (numImages === 2) {
    imageHandlingStrategy = `
    - **CHẾ ĐỘ ĐỐI KHÁNG/CẶP ĐÔI (2 ẢNH)**:
      Hệ thống nhận diện 2 ảnh tham chiếu.
      **BỐ CỤC**: Chia đôi màn hình (Split Screen) hoặc Versus (Vs).
      **NHIỆM VỤ**:
      1. Đặt Nhân vật từ Ảnh 1 ở bên Trái.
      2. Đặt Nhân vật từ Ảnh 2 ở bên Phải.
      3. Tạo tương tác giữa họ (nhìn nhau, chiến đấu, hoặc cùng nhìn về phía trước).
    `;
  } else {
    // Logic cho 3 ảnh trở lên - Bố cục Tam giác
    imageHandlingStrategy = `
    - **CHẾ ĐỘ TỔNG HỢP NHÓM (GROUP SYNTHESIS - ${numImages} ẢNH)**:
      ⚠️ QUAN TRỌNG: Đã phát hiện ${numImages} ảnh đầu vào. BẮT BUỘC PHẢI VẼ ĐỦ ${numImages} ĐỐI TƯỢNG RIÊNG BIỆT.
      
      **CHIẾN THUẬT BỐ CỤC TAM GIÁC (TRIANGLE COMPOSITION):**
      1. **Vị trí**:
         - Đặt Đối tượng quan trọng nhất (từ Ảnh 1) ở TRUNG TÂM hoặc Tiền cảnh.
         - Đặt 2 Đối tượng còn lại (từ Ảnh 2 và Ảnh 3) ở hai bên hoặc lùi về phía sau một chút (Hậu cảnh).
      2. **Entity Isolation (Cô lập đối tượng)**:
         - Không để các nhân vật đè lên nhau quá nhiều.
         - Hãy đảm bảo khuôn mặt của cả 3 nhân vật đều nhìn thấy rõ.
      3. **ROLL CALL (Điểm danh)**:
         - Trước khi render, hãy tự kiểm tra: "Tôi đã vẽ người từ Ảnh 1 chưa?", "Ảnh 2 chưa?", "Ảnh 3 chưa?". Nếu thiếu bất kỳ ai, hãy vẽ lại ngay lập tức.
      
      **LOGIC HỢP NHẤT**:
      - Các nhân vật phải tương tác trong cùng một không gian ánh sáng.
      - Giữ nguyên đặc điểm khuôn mặt của từng người theo ảnh gốc.
    `;
  }

  // --- TEXT HANDLING LOGIC ---

  // 1. Main Text Protocol
  let mainTextProtocol = "";
  let mainTextLayout = "";
  
  if (hasMainText) {
    mainTextProtocol = `
    1. **XỬ LÝ VĂN BẢN CHÍNH ("${mainText}")**:
       - **Chế độ vẽ**: Hãy "vẽ" lại chuỗi ký tự này thay vì "viết" nó. Coi nó là một Texture đồ họa bất biến.
       - **Dấu câu (Diacritics)**: Các dấu (Sắc, Huyền, Hỏi, Ngã, Nặng) và Mũ (Â, Ê, Ô, Ư, Ơ) phải được vẽ ĐẬM, RÕ RÀNG, và KHÔNG DÍNH vào thân chữ cái.
       - **Font chữ**: Bắt buộc sử dụng Font **Sans-Serif Nét Dày (Bold Block Font)** (ví dụ: Roboto Black, Impact, Open Sans ExtraBold). Tuyệt đối KHÔNG dùng font thư pháp (Calligraphy) hay font trang trí rối mắt vì sẽ làm mất dấu tiếng Việt.
       - **Layer**: Text phải nằm ở LỚP TRÊN CÙNG (Topmost Layer), có viền (Stroke) và bóng đổ (Drop Shadow).
    `;
    mainTextLayout = `
       - **TEXT CHÍNH ("${mainText}")**:
         - Render dạng **3D Sticker**.
         - Màu sắc: Vàng chanh, Cam rực, hoặc Trắng tinh khôi (tùy nền, phải tương phản mạnh).
         - Vị trí: Đặt ở vùng trống (Negative Space), không che mặt nhân vật.
    `;
  } else {
    mainTextProtocol = `
    1. **KHÔNG CÓ VĂN BẢN CHÍNH**:
       - Người dùng KHÔNG nhập nội dung Main Text.
       - **YÊU CẦU TUYỆT ĐỐI**: KHÔNG ĐƯỢC VẼ BẤT KỲ CHỮ CÁI NÀO Ở VỊ TRÍ TIÊU ĐỀ. HÌNH ẢNH PHẢI SẠCH SẼ KHÔNG CÓ TEXT CHÍNH.
    `;
    mainTextLayout = `
       - **TEXT CHÍNH**: (Trống) -> Để trống khu vực này.
    `;
  }

  // 2. Sub Text Protocol
  let subTextProtocol = "";
  
  if (hasSubText) {
    subTextProtocol = `
       - **TEXT PHỤ (SUB-TEXT)**:
         - Nội dung: "${subText}"
         - YÊU CẦU QUAN TRỌNG: Viết chính xác từng dấu tiếng Việt.
         - Vị trí: Nhỏ hơn Text chính, đặt ngay bên dưới hoặc phía trên Text chính.
         - Hiệu ứng: Dùng nền text (Text Box) bán trong suốt màu tối/sáng để chữ nổi bật hẳn lên.
    `;
  } else {
    subTextProtocol = `
       - **KHÔNG CÓ TEXT PHỤ**: Tuyệt đối KHÔNG TỰ Ý THÊM bất kỳ dòng chữ, slogan, hay phụ đề nào khác. Chỉ hiển thị duy nhất Text Chính (nếu có).
    `;
  }

  // 3. Global Text Rules (Clean Mode check)
  let globalTextRule = "";
  if (!hasMainText && !hasSubText) {
    globalTextRule = `
    [CHẾ ĐỘ SẠCH (CLEAN ART MODE)]
    - Người dùng KHÔNG nhập bất kỳ text nào.
    - **YÊU CẦU TỐI CAO**: Tạo ra hình ảnh hoàn toàn KHÔNG CÓ CHỮ (No Text). Không có tiêu đề, không có lời thoại, không có watermark. Chỉ có hình ảnh nghệ thuật.
    `;
  }

  // Logic xử lý Style Mapping (Đại tu nâng cấp)
  let styleInstruction = "";
  switch (style) {
    case ThumbnailStyle.COMIC_BOOK:
      styleInstruction = `
      - **Style: COMIC BOOK / POP ART (Truyện Tranh Mỹ)**
        - **Engine**: 2D Flat shading + Halftone Pattern Overlay.
        - **Visuals**: EXPLOSIVE RADIAL SUNBURST (Tia sáng nan hoa) tập trung vào chủ thể. Viền đen dày (Thick black outlines). Bong bóng thoại (nếu cần).
        - **Colors**: Primary colors (Red, Yellow, Blue) rực rỡ, độ bão hòa cao.
        - **Action**: Kịch tính, hành động phóng đại, hiệu ứng tốc độ (Speed lines).
      `;
      break;
    case ThumbnailStyle.CINEMATIC_3D:
      styleInstruction = `
      - **Style: 3D CINEMATIC ANIMATION (Pixar/Disney)**
        - **Engine**: Unreal Engine 5 / Pixar RenderMan.
        - **Visuals**: 3D Character Design, mắt to biểu cảm, tỉ lệ cơ thể hoạt hình. Da có độ tán xạ dưới bề mặt (Subsurface scattering).
        - **Lighting**: Soft volumetric lighting, Warm Rim Light, Bokeh background.
        - **Mood**: Dễ thương, kỳ diệu, thân thiện.
      `;
      break;
    case ThumbnailStyle.REALISTIC:
      styleInstruction = `
      - **Style: HYPER REALISTIC 4K (Ảnh Thật)**
        - **Camera**: Sony A7R IV, Lens 85mm f/1.2 G Master (Chân dung xóa phông).
        - **Visuals**: Chi tiết da (Skin texture), lỗ chân lông, tóc thực tế 100%. Không phải tranh vẽ.
        - **Lighting**: Cinematic Studio Lighting (Rembrandt lighting).
        - **Quality**: 8K, Ultra-detailed, Sharp focus.
      `;
      break;
    case ThumbnailStyle.HYPER_VIRAL:
      styleInstruction = `
      - **Style: HYPER-VIRAL (MrBeast Style)**
        - **Concept**: High-Click-Through-Rate (CTR) Optimization.
        - **Visuals**: Độ tương phản cực cao (High Contrast). Biểu cảm khuôn mặt "SHOCKED" hoặc "EXCITED" phóng đại. Mắt mở to, miệng há hốc.
        - **Colors**: Saturation +100. Nền rực rỡ, thường là màu Blue hoặc Red.
        - **Lighting**: Bright Studio Floodlights (Sáng đều, không có bóng tối).
      `;
      break;
    case ThumbnailStyle.NEON_GAMING:
      styleInstruction = `
      - **Style: NEON CYBERPUNK GAMING (Valorant/LoL Style)**
        - **Art Style**: Riot Games Splash Art / Cyberpunk 2077.
        - **Visuals**: Hiệu ứng Glitch, Chromatic Aberration. Khói màu.
        - **Lighting**: Dual Tone Lighting (Teal & Orange hoặc Purple & Blue). Neon Glow từ các cạnh.
        - **Mood**: Cạnh tranh, công nghệ cao, tương lai, Esport.
      `;
      break;
    case ThumbnailStyle.GTA_ART:
      styleInstruction = `
      - **Style: GTA V LOADING SCREEN ART**
        - **Technique**: Digital Painting lai Cel-shading.
        - **Visuals**: Viền đen sắc nét bao quanh nhân vật. Đổ bóng cứng (Hard Shadows).
        - **Colors**: Màu nắng California (Vàng ấm, Cam). Bầu trời xanh ngắt.
        - **Vibe**: Gangster, Cool, Stylized Realism.
      `;
      break;
    case ThumbnailStyle.ANIME:
      styleInstruction = `
      - **Style: ANIME / MANGA (Shinkai/Ghibli)**
        - **Art Style**: Chất lượng phim chiếu rạp (Makoto Shinkai clouds, Ghibli food).
        - **Visuals**: Cel-shaded characters, đường nét mảnh. Nền chi tiết tuyệt đẹp.
        - **Lighting**: Ánh sáng lấp lánh (Sparkles), Lens flare đẹp mắt.
      `;
      break;
    case ThumbnailStyle.VECTOR_ART:
      styleInstruction = `
      - **Style: FLAT VECTOR ART (Minimalist)**
        - **Concept**: Corporate Memphis / Kurgesagt style.
        - **Visuals**: Hình khối hình học, không có viền (No outlines), màu bệt (Solid colors).
        - **Mood**: Hiện đại, sạch sẽ, thông tin rõ ràng.
      `;
      break;
    case ThumbnailStyle.HORROR:
      styleInstruction = `
      - **Style: DARK HORROR / CREEPYPASTA**
        - **Visuals**: Hiệu ứng nhiễu hạt (Film Grain), tối góc (Vignette).
        - **Lighting**: Low-key lighting, ánh sáng từ dưới lên (gây sợ hãi).
        - **Colors**: Desaturated (Mất màu), tông Xanh rêu tối hoặc Đỏ máu.
        - **Mood**: Bí ẩn, đáng sợ, căng thẳng.
      `;
      break;
    case ThumbnailStyle.TECH_MINIMALIST:
      styleInstruction = `
      - **Style: TECH REVIEW MINIMALIST (MKBHD Style)**
        - **Visuals**: Chụp sản phẩm cao cấp (Product Photography). Nền Matte Black hoặc Xám đậm.
        - **Lighting**: Ánh sáng cạnh sắc nét (Sharp Rim Light) màu đỏ hoặc xanh dương.
        - **Focus**: Chủ thể sắc nét tuyệt đối, nền sạch sẽ không rối mắt.
      `;
      break;
    default:
      styleInstruction = `- Phong cách yêu cầu: ${style} (Hãy thể hiện đúng đặc trưng thị giác của phong cách này).`;
  }

  // Auto-Inference Logic (Cầu nối ngữ cảnh) khi Prompt trống
  let promptContextLogic = "";
  if (!userPrompt || userPrompt.trim() === "") {
    if (numImages > 0 && hasMainText) {
      promptContextLogic = `
      [AUTO-INFERENCE: CONTEXTUAL BRIDGE]
      - Người dùng không cung cấp mô tả cảnh, nhưng có Ảnh và Text "${mainText}".
      - **NHIỆM VỤ**: Hãy suy luận bối cảnh dựa trên nội dung Text. (Ví dụ: Nếu Text là "Du lịch", hãy vẽ bãi biển/núi non. Nếu Text là "Gaming", hãy vẽ phòng máy Cyberpunk).
      - Đặt các nhân vật từ ảnh tham chiếu vào bối cảnh đã suy luận đó.
      `;
    } else if (numImages > 0 && !hasMainText) {
       promptContextLogic = `
      [AUTO-INFERENCE: PORTRAIT MODE]
      - Người dùng không cung cấp mô tả và không có Text.
      - **NHIỆM VỤ**: Tạo một bức chân dung nghệ thuật (Cinematic Portrait) tôn vinh vẻ đẹp/đặc điểm của nhân vật trong ảnh tham chiếu. Nền mờ ảo, ánh sáng studio đẹp.
      `;
    } else {
       promptContextLogic = `
      - Hãy sáng tạo một hình ảnh ngẫu nhiên nhưng cực kỳ ấn tượng (Viral Thumbnail style).
      `;
    }
  } else {
    promptContextLogic = `- Mô tả chi tiết cảnh: ${userPrompt}`;
  }

  // Refined prompt construction
  const promptText = `
    [SYSTEM ROLE & STYLE - HIDDEN DEFAULT]
    Đóng vai trò là một giám đốc sáng tạo (Creative Director) đẳng cấp thế giới chuyên về thiết kế thumbnail YouTube với tỷ lệ nhấp (CTR) cực cao. 
    Phong cách ảnh là "Hyper-realistic commercial photography" (nhiếp ảnh thương mại siêu thực), kết hợp với màu sắc "vibrant, oversaturated" (rực rỡ, bão hòa cao) và ánh sáng điện ảnh kịch tính.

    [GIAO THỨC VĂN BẢN & CHÍNH TẢ TIẾNG VIỆT]
    ⚠️ CẢNH BÁO: Tuân thủ nghiêm ngặt các quy tắc về văn bản dưới đây.

    ${globalTextRule}
    ${mainTextProtocol}

    [YÊU CẦU TỰ ĐỘNG SẮP XẾP BỐ CỤC - AUTO LAYOUT ENGINE]
    Hãy tư duy theo lớp (Layers) để tạo chiều sâu 3D cho ảnh:

    1. **Lớp Tiền Cảnh (Foreground - Quan trọng nhất)**:
       - Đặt Nhân vật chính hoặc Vật thể chính (như ảnh mẫu) ở kích thước lớn.
       - Biểu cảm khuôn mặt phải CỰC KỲ RÕ RÀNG.
       - Vị trí: Tuân thủ quy tắc 1/3 (Đặt ở 1/3 Trái hoặc 1/3 Phải).

    2. **Lớp Trung Cảnh (Middleground - Text Zone)**:
       ${mainTextLayout}
       ${subTextProtocol}
       - **QUAN TRỌNG**: KHÔNG render thêm bất kỳ chữ cái, ký tự hay watermark nào khác ngoài các nội dung đã chỉ định ở trên.

    3. **Lớp Hậu Cảnh (Background - Bối cảnh)**:
       - Nền phải liên quan đến nội dung nhưng được làm mờ nhẹ hoặc tối hơn để tôn vinh chủ thể.
       - Thêm hiệu ứng "Action" nếu cần thiết.

    [THÔNG TIN ĐẦU VÀO CỤ THỂ]
    - Tỷ lệ: ${aspectRatio}
    ${styleInstruction}
    ${promptContextLogic}
    ${imageHandlingStrategy}

    HÃY TẠO RA MỘT THUMBNAIL CÓ SỨC HÚT KHÔNG THỂ CƯỠNG LẠI.
  `;

  const parts: Part[] = [];

  // Add reference images if they exist
  if (referenceImages && referenceImages.length > 0) {
    referenceImages.forEach((base64Data, index) => {
      // Regex to parse MIME type and data properly
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      
      let mimeType = 'image/png'; // Default fallback
      let cleanData = base64Data;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        cleanData = matches[2];
      } else if (base64Data.includes('base64,')) {
         // Fallback split if regex fails but standard format
         cleanData = base64Data.split('base64,')[1];
      }

      parts.push({
        inlineData: {
          data: cleanData,
          mimeType: mimeType, 
        },
      });
      // Add text marker for each image to help model identify them
      parts.push({ text: `[IMAGE_REFERENCE_${index + 1}]` });
    });
  }

  // Add text prompt
  parts.push({ text: promptText });

  // Helper to extract image from response
  const extractImage = (response: any): string => {
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error("Không tạo được hình ảnh. Vui lòng thử lại với mô tả khác.");
  };

  try {
    // Attempt 1: Try High-Quality Pro Model (Banana Pro)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "2K", 
        },
      },
    });
    return extractImage(response);

  } catch (error: any) {
    console.warn("Primary model failed, attempting fallback to Flash...", error);

    // Fallback logic for Banana Flash
    if (error.status === 'PERMISSION_DENIED' || 
        error.message?.includes('403') || 
        error.message?.includes('not found') || 
        error.status === 403) {
      
      try {
        console.log("Falling back to gemini-2.5-flash-image...");
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
            },
          },
        });
        return extractImage(fallbackResponse);

      } catch (fallbackError: any) {
         console.error("Fallback model also failed:", fallbackError);
         throw new Error(`Lỗi tạo ảnh: ${fallbackError.message || "Không xác định"}`);
      }
    }
    
    throw error;
  }
};
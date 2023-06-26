uniform sampler2D inputTexture; // 输入纹理
in vec2 uv; // 纹理坐标
out vec4 fragColor; // 输出颜色

const float PI = 3.141592653589793238;

void main() {
  vec2 normalizedUV = uv * 2.0 - 1.0; // 将纹理坐标映射到范围 [-1, 1]

  float r = length(normalizedUV); // 极坐标半径
  float theta = atan(normalizedUV.y, normalizedUV.x); // 极坐标角度

  // 计算鱼眼投影前的极坐标半径
  float fisheyeR = 2.0 * sin(r * (PI / 2.0));

  // 将极坐标转换回笛卡尔坐标
  vec2 fisheyeUV = vec2(fisheyeR * cos(theta), fisheyeR * sin(theta));

  // 将鱼眼坐标从 [-1, 1] 映射回纹理坐标 [0, 1]
  fisheyeUV = (fisheyeUV + 1.0) * 0.5;

  // 在指定纹理坐标处获取原始颜色，并输出
  fragColor = texture(inputTexture, fisheyeUV);
}
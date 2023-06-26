#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

// 生成立方体相机的透视矩阵
glm::mat4 generateCubeCameraPerspectiveMatrix(float nearPlane, float farPlane)
{
    // 定义六个面的位置和方向
    glm::vec3 position = glm::vec3(0.0f, 0.0f, 0.0f);
    glm::vec3 targets[6] = {
        glm::vec3(1.0f, 0.0f, 0.0f),  // 右
        glm::vec3(-1.0f, 0.0f, 0.0f), // 左
        glm::vec3(0.0f, 1.0f, 0.0f),  // 上
        glm::vec3(0.0f, -1.0f, 0.0f), // 下
        glm::vec3(0.0f, 0.0f, 1.0f),  // 前
        glm::vec3(0.0f, 0.0f, -1.0f)  // 后
    };

    // 设置投影矩阵的参数
    float fovY = 90.0f; // 垂直方向的视野角度
    float aspectRatio = 1.0f; // 宽高比
    float top = nearPlane * tan(glm::radians(fovY / 2.0f));
    float bottom = -top;
    float left = bottom;
    float right = top;

    // 构造六个面的投影矩阵并合并到一个立方体贴图矩阵中
    glm::mat4 cubeCameraMatrix = glm::mat4(1.0f);
    for (int i = 0; i < 6; i++)
    {
        glm::mat4 viewMatrix = glm::lookAt(position, position + targets[i], glm::vec3(0.0f, -1.0f, 0.0f));
        glm::mat4 projectionMatrix = glm::frustum(left, right, bottom, top, nearPlane, farPlane);
        glm::mat4 faceMatrix = projectionMatrix * viewMatrix;
        cubeCameraMatrix[i] = faceMatrix;
    }

    return cubeCameraMatrix;
}
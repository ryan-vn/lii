import {
  AlipayOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoOutlined,
  UserOutlined,
  WeiboOutlined,
} from "@ant-design/icons";
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Divider, Space, Tabs, message, theme } from "antd";
import type { CSSProperties } from "react";
import { useState } from "react";

type LoginType = "phone" | "account";

const iconStyles: CSSProperties = {
  color: "rgba(0, 0, 0, 0.2)",
  fontSize: "18px",
  verticalAlign: "middle",
  cursor: "pointer",
};

const Page = () => {
  const [loginType, setLoginType] = useState<LoginType>("phone");
  const { token } = theme.useToken();
  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      <LoginFormPage
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="TradeSkillMaster Analyzer"
        containerStyle={{
          backgroundColor: "rgba(0, 0, 0,0.65)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => setLoginType(activeKey as LoginType)}
        >
          <Tabs.TabPane key={"account"} tab={"账号密码登录"} />
          <Tabs.TabPane key={"phone"} tab={"手机号登录"} />
        </Tabs>
        {loginType === "account" && (
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: "large",
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"用户名: admin or user"}
              rules={[
                {
                  required: true,
                  message: "请输入用户名!",
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"密码: ant.design"}
              rules={[
                {
                  required: true,
                  message: "请输入密码！",
                },
              ]}
            />
          </>
        )}
        {loginType === "phone" && (
          <>
            <ProFormText
              fieldProps={{
                size: "large",
                prefix: (
                  <MobileOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              name="mobile"
              placeholder={"手机号"}
              rules={[
                {
                  required: true,
                  message: "请输入手机号！",
                },
                {
                  pattern: /^1\d{10}$/,
                  message: "手机号格式错误！",
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              captchaProps={{
                size: "large",
              }}
              placeholder={"请输入验证码"}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${"获取验证码"}`;
                }
                return "获取验证码";
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: "请输入验证码！",
                },
              ]}
              onGetCaptcha={async () => {
                message.success("获取验证码成功！验证码为：1234");
              }}
            />
          </>
        )}
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: "right",
            }}
          >
            忘记密码
          </a>
        </div>
      </LoginFormPage>
    </div>
  );
};

export default () => {
  return (
    <ProConfigProvider dark>
      <Page />
    </ProConfigProvider>
  );
};

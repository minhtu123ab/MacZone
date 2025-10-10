import { Typography } from "antd";

const { Paragraph } = Typography;

export default function Footer() {
  return (
    <footer className="bg-dark-card py-12 border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <img src="/logo-text.svg" alt="MacZone" className="h-12 mx-auto mb-4" />
        <Paragraph className="!text-apple-gray">
          © 2024 MacZone. Premium Apple Products Store.
        </Paragraph>
      </div>
    </footer>
  );
}

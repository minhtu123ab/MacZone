import { Typography } from "antd";

const { Paragraph } = Typography;

export default function Footer() {
  return (
    <footer className="bg-dark-card py-12 border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/logo.svg" alt="MacZone Icon" className="h-10" />
          <img src="/logo-maczone-text.svg" alt="MacZone" className="h-10" />
        </div>
        <Paragraph className="!text-apple-gray">
          © 2025 MacZone. Premium Apple Products Store.
        </Paragraph>
      </div>
    </footer>
  );
}

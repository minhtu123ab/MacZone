import { Card } from "antd";
import PropTypes from "prop-types";

export default function AuthCard({ children }) {
  return (
    <Card className="glass glow-sm !border-dark-border">{children}</Card>
  );
}

AuthCard.propTypes = {
  children: PropTypes.node.isRequired,
};


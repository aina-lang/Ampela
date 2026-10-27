import React from "react";
import Button from "@/components/ui/Button";

/**
 * @deprecated Utiliser PrimaryButton / SecondaryButton / GhostButton
 * de "@/components/ui". Conservé comme alias pour les anciens écrans.
 */
const ModernButton = ({ variant, ...props }) => (
  <Button {...props} variant={variant === "outlined" ? "secondary" : "primary"} />
);

export default ModernButton;

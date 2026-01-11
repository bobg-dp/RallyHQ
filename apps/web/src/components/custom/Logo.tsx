import { motion } from "framer-motion";
import Text from "../custom-ui/text";

export default function Logo({ textClass }: { textClass?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex"
    >
      <Text
        label="Rally"
        className={`text-xl font-bold text-foreground font-audiowide ${
          textClass ? textClass : ""
        }`}
      />
      <Text
        label="H"
        className={`text-xl font-bold text-secondary-foreground font-audiowide ${
          textClass ? textClass : ""
        }`}
      />
      <Text
        label="Q"
        className={`text-xl font-bold text-primary font-audiowide ${
          textClass ? textClass : ""
        }`}
      />
    </motion.div>
  );
}

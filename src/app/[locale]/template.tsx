import type { ReactNode } from "react";

import PageTransition from "@/components/motion/PageTransition";

type Props = {
  children: ReactNode;
};

export default function Template({ children }: Props) {
  return <PageTransition>{children}</PageTransition>;
}

import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineXMark } from "react-icons/hi2";
import { Link } from 'react-router-dom';
import { ModeToggle } from '../mode-toggle';
import Text from '../custom-ui/text';
import useAuth from "@/hooks/use-auth";
import { navLinks } from "./nav-links";
import Logo from "../custom/Logo";

export default function SideNav({ isOpen, handleClose }: { isOpen: boolean, handleClose: () => void }) {
    const { isAuthenticated, logout } = useAuth();

    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 select-none md:hidden bg-black/50 backdrop-blur-sm z-10"
              onClick={handleClose}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed inset-y-0 left-0 z-30 w-[300px] bg-white/95 dark:bg-black/95 border-r dark:border-r-gray-800 overflow-y-auto md:hidden backdrop-blur-md"
            >
              <div className="flex items-center justify-between h-[80px] px-4 border-b dark:border-b-gray-800">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Logo />
                </motion.div>
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ModeToggle />
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                  >
                    <HiOutlineXMark className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer transition-colors" />
                  </motion.button>
                </div>
              </div>
              <div className="p-4 space-y-6">
                {/* Main section - same links as navbar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2">
                    Main
                  </h3>

                  {navLinks.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                    >
                      <Link
                        to={item.to}
                        className="flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-1"
                        onClick={handleClose}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Account section - mirrors navbar auth buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2">
                    Account
                  </h3>

                  {isAuthenticated ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-1"
                          onClick={handleClose}
                        >
                          Dashboard
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <button
                          onClick={() => {
                            logout();
                            handleClose();
                          }}
                          className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-destructive dark:text-destructive hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-1 text-left"
                        >
                          Wyloguj
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-1"
                          onClick={handleClose}
                        >
                          Logowanie
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link
                          to="/rejestracja"
                          className="flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-1"
                          onClick={handleClose}
                        >
                          Rejestracja
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <motion.div
            className="w-32 h-32 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Learnonauts
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Embark on an amazing journey to discover the magic of Artificial Intelligence! 
            Learn through games, puzzles, and hands-on activities designed just for you.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {[
            {
              icon: Play,
              title: "Learn by Playing",
              description: "Interactive games and drag-and-drop activities make learning fun!"
            },
            {
              icon: BookOpen,
              title: "No Coding Required",
              description: "Understand AI concepts through visual stories and experiments."
            },
            {
              icon: Sparkles,
              title: "Earn Badges",
              description: "Collect achievements and track your progress as you explore."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.button
            onClick={onGetStarted}
            className="bg-white text-purple-600 font-bold text-xl px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus-ring"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start your AI learning journey"
          >
            Start Your AI Adventure! 🚀
          </motion.button>
        </motion.div>

        {/* Accessibility Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-12 text-white/70 text-sm"
        >
          <p>
            Designed for all learners • Keyboard accessible • Screen reader friendly
          </p>
        </motion.div>
      </div>
    </div>
  );
}

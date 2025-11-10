import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ManagePostsList = ({ posts }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Recursos Existentes ({posts.length})</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                <AnimatePresence>
                    {posts.length > 0 ? posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="glass-effect p-4 rounded-lg flex justify-between items-center"
                        >
                            <div>
                                <h4 className="font-bold text-lg">{post.title}</h4>
                                <p className="text-sm text-gray-400">{post.categories?.name || 'Sin categoría'} - {post.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to={`/recursos/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10 h-9 w-9">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link to={`/control-panel-7d8a2b3c4f5e/edit/${post.slug}`}>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )) : (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-400 text-center py-8"
                        >
                            No se encontraron recursos con los filtros actuales.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManagePostsList;
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, PlusCircle } from 'lucide-react';

const KeywordInput = ({ keywords, setKeywords, defaultKeywords }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && inputValue.trim() !== '') {
            event.preventDefault();
            addKeyword(inputValue.trim());
        }
    };

    const addKeyword = (keyword) => {
        if (keyword && !keywords.includes(keyword)) {
            setKeywords([...keywords, keyword]);
        }
        setInputValue('');
    };

    const removeKeyword = (keywordToRemove) => {
        setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
    };

    return (
        <div className="mt-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {keywords.map(keyword => (
                    <span key={keyword} className="flex items-center bg-blue-700/30 text-grey-600   text-sm font-medium px-2.5 py-1 rounded-full">
                        {keyword}
                        <button type="button" onClick={() => removeKeyword(keyword)} className="ml-2 text-gray-600 hover:text-white">
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
            <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Añade una palabra clave y presiona Enter"
                className="bg-black/30 border-white/20"
            />
            <div className="mt-3">
                <p className="text-sm text-gray-400 mb-2">Sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                    {defaultKeywords.filter(k => !keywords.includes(k)).map(keyword => (
                        <Button
                            key={keyword}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                            onClick={() => addKeyword(keyword)}
                        >
                            <PlusCircle size={14} className="mr-2" />
                            {keyword}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KeywordInput;
import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer, BubbleMenu } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import BaseImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import BaseTableCell from '@tiptap/extension-table-cell';
import TiptapToolbar from './TiptapToolbar';
import { useToast } from '@/app/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from "@/app/components/ui/dropdown-menu";
import {
  AlignCenter, AlignLeft, AlignRight, Trash2, Lock, Unlock,
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Heading1, Heading2, Heading3, PaintBucket, Link2
} from 'lucide-react';
import { uploadPostImage } from '@/app/lib/supabase/assets';
import { createClient } from '@/app/utils/supabase/client';

const PREDEFINED_COLORS = [
  { label: 'Negro', value: '#000000' },
  { label: 'Gris oscuro', value: '#444444' },
  { label: 'Gris', value: '#999999' },
  { label: 'Blanco', value: '#FFFFFF' },
  { label: 'Rojo', value: '#E60000' },
  { label: 'Naranja', value: '#FF9900' },
  { label: 'Amarillo', value: '#FFFF00' },
  { label: 'Verde', value: '#008A00' },
  { label: 'Cian', value: '#00D0D0' },
  { label: 'Azul', value: '#0066CC' },
  { label: 'Púrpura', value: '#990099' },
  { label: 'Rosa', value: '#FF0099' },
];

const ResizableImageTemplate = ({ node, updateAttributes, editor, getPos }) => {
  const { src, alt, align, width, height } = node.attrs;
  const [localWidth, setLocalWidth] = useState(width);
  const [localHeight, setLocalHeight] = useState(height);

  useEffect(() => {
    setLocalWidth(width);
    setLocalHeight(height);
  }, [width, height]);

  const handleAlign = (newAlign) => {
    updateAttributes({ align: newAlign });
  };

  const handleDelete = () => {
    const pos = getPos();
    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      e.target.blur();
    }
  };

  const handleSizeChange = (attribute, value) => {
    const trimmedValue = value.trim();
    if (/^\d+$/.test(trimmedValue)) {
      updateAttributes({ [attribute]: `${trimmedValue}%` });
    } else {
      updateAttributes({ [attribute]: trimmedValue });
    }
  };

  return (
    <NodeViewWrapper
      className="resizable-image-wrapper relative group"
      data-align={align}
    >
      <div style={{ width }} className={`mx-auto ${align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto'}`}>
        <img src={src} alt={alt} className="w-full h-auto" style={{ height }} />
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded p-1">
        <button onClick={() => handleAlign('left')} className={`p-1 rounded ${align === 'left' ? 'bg-muted' : ''}`}><AlignLeft className="w-4 h-4" /></button>
        <button onClick={() => handleAlign('center')} className={`p-1 rounded ${align === 'center' ? 'bg-muted' : ''}`}><AlignCenter className="w-4 h-4" /></button>
        <button onClick={() => handleAlign('right')} className={`p-1 rounded ${align === 'right' ? 'bg-muted' : ''}`}><AlignRight className="w-4 h-4" /></button>
        <button onClick={handleDelete} className="p-1 rounded bg-destructive"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded p-1">
        <input
          type="text"
          className="w-24 bg-input text-foreground text-xs p-1 rounded"
          placeholder="Ancho (ej: 50%)"
          value={localWidth}
          onChange={(e) => setLocalWidth(e.target.value)}
          onBlur={() => handleSizeChange('width', localWidth)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="text"
          className="w-24 bg-input text-foreground text-xs p-1 rounded"
          placeholder="Alto (ej: auto)"
          value={localHeight}
          onChange={(e) => setLocalHeight(e.target.value)}
          onBlur={() => handleSizeChange('height', localHeight)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </NodeViewWrapper>
  );
};

const ResizableImage = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.style.width || '100%',
        renderHTML: (attributes) => {
          return {
            style: `width: ${attributes.width}; height: ${attributes.height};`,
          };
        },
      },
      height: {
        default: 'auto',
        parseHTML: element => element.style.height || 'auto',
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => ({
          'data-align': attributes.align,
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageTemplate);
  },
});

const TableWithInvisibility = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      invisible: {
        default: false,
        parseHTML: element => element.getAttribute('data-invisible') === 'true',
        renderHTML: attributes => {
          if (attributes.invisible) {
            return { 'data-invisible': 'true' };
          }
          return {};
        },
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (attributes.backgroundColor) {
            return {
              style: `background-color: ${attributes.backgroundColor}`,
            };
          }
          return {};
        },
      },
      borderStyle: { // New attribute
        default: null,
        parseHTML: element => element.style.borderStyle,
        renderHTML: attributes => {
          if (attributes.borderStyle) {
            return {
              style: `border-style: ${attributes.borderStyle}`,
            };
          }
          return {};
        },
      },
    };
  },
});

const TableCell = BaseTableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (attributes.backgroundColor) {
            return {
              style: `background-color: ${attributes.backgroundColor}`,
            };
          }
          return {};
        },
      },
      borderStyle: { // New attribute
        default: null,
        parseHTML: element => element.style.borderStyle,
        renderHTML: attributes => {
          if (attributes.borderStyle) {
            return {
              style: `border-style: ${attributes.borderStyle}`,
            };
          }
          return {};
        },
      },
    };
  },
});

const getYouTubeID = (url) => {
  if (!url) return null;
  const regex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const ResizableYouTubeTemplate = ({ node, updateAttributes, editor, getPos }) => {
  const { src, align, width, height } = node.attrs;
  const [localWidth, setLocalWidth] = useState(width);
  const [localHeight, setLocalHeight] = useState(height);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const aspectRatio = 16 / 9;

  useEffect(() => {
    setLocalWidth(width);
    setLocalHeight(height);
  }, [width, height]);

  const handleAlign = (newAlign) => {
    updateAttributes({ align: newAlign });
  };

  const handleDelete = () => {
    const pos = getPos();
    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
  };

  const applySizeChanges = (changedAttribute) => {
    let newWidth = parseInt(localWidth, 10);
    let newHeight = parseInt(localHeight, 10);

    if (keepAspectRatio) {
      if (changedAttribute === 'width') {
        if (!isNaN(newWidth)) {
          newHeight = Math.round(newWidth / aspectRatio);
          setLocalHeight(newHeight);
        }
      } else if (changedAttribute === 'height') {
        if (!isNaN(newHeight)) {
          newWidth = Math.round(newHeight * aspectRatio);
          setLocalWidth(newWidth);
        }
      }
    }

    updateAttributes({
      width: isNaN(newWidth) ? null : newWidth,
      height: isNaN(newHeight) ? null : newHeight,
    });
  };

  const handleKeyDown = (e, attribute) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      applySizeChanges(attribute);
      e.target.blur();
    }
  };

  const videoId = getYouTubeID(src);
  const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  const containerStyle = {
    display: 'flex',
    justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
  };

  return (
    <NodeViewWrapper
      className="youtube-wrapper relative group"
      data-align={align}
    >
      <div style={containerStyle}>
        <iframe
          width={node.attrs.width}
          height={node.attrs.height}
          src={embedSrc}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded p-1">
        <button onClick={() => handleAlign('left')} className={`p-1 rounded ${align === 'left' ? 'bg-muted' : ''}`}><AlignLeft className="w-4 h-4" /></button>
        <button onClick={() => handleAlign('center')} className={`p-1 rounded ${align === 'center' ? 'bg-muted' : ''}`}><AlignCenter className="w-4 h-4" /></button>
        <button onClick={() => handleAlign('right')} className={`p-1 rounded ${align === 'right' ? 'bg-muted' : ''}`}><AlignRight className="w-4 h-4" /></button>
        <button onClick={handleDelete} className="p-1 rounded bg-destructive"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded p-1">
        <input
          type="text"
          className="w-20 bg-input text-foreground text-xs p-1 rounded"
          placeholder="Ancho"
          value={localWidth || ''}
          onChange={(e) => setLocalWidth(e.target.value)}
          onBlur={() => applySizeChanges('width')}
          onKeyDown={(e) => handleKeyDown(e, 'width')}
        />
        <button onClick={() => setKeepAspectRatio(!keepAspectRatio)} className="p-1 rounded">
          {keepAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
        <input
          type="text"
          className="w-20 bg-input text-foreground text-xs p-1 rounded"
          placeholder="Alto"
          value={localHeight || ''}
          onChange={(e) => setLocalHeight(e.target.value)}
          onBlur={() => applySizeChanges('height')}
          onKeyDown={(e) => handleKeyDown(e, 'height')}
        />
      </div>
    </NodeViewWrapper>
  );
};

const ResizableYouTube = Youtube.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
      },
      width: {
        default: 560,
      },
      height: {
        default: 315,
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes.align || 'center';
    const width = HTMLAttributes.width || this.options.width;
    const height = HTMLAttributes.height || this.options.height;

    const getEmbedURL = (url) => {
      const videoId = getYouTubeID(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    const wrapperStyle = {
      'display': 'flex',
      'justify-content': align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
    };

    return [
      'div',
      { 'data-youtube-video': '', style: `display: flex; justify-content: ${wrapperStyle['justify-content']}` },
      [
        'iframe',
        {
          width: width,
          height: height,
          src: getEmbedURL(HTMLAttributes.src),
          frameborder: 0,
          allowfullscreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        },
      ],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableYouTubeTemplate);
  },
});





const TiptapEditor = ({ content, onChange, placeholder = "Empieza a escribir aquí...", onAiAction, onGenerateContent, getEditor, onInternalLink, onSuggestLinks }) => {
  const { toast } = useToast();
  const supabase = createClient();
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        validate: href => /^https?:\/\//.test(href) || /^\//.test(href) || /^#/.test(href),
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      ResizableYouTube.configure({ controls: false }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200/50 dark:bg-yellow-400/50',
        },
      }),
      TableWithInvisibility.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow,
      CustomTableHeader,
      TableCell,
    ],
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[200px] bg-background text-foreground [&_p]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground p-4 rounded-b-lg border border-input border-t-0 w-full',
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          handleImageUpload(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const file = event.clipboardData?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          handleImageUpload(file);
          return true;
        }
        return false;
      },
    },
    immediatelyRender: false, // Add this line
  });

  const handleImageUpload = useCallback(async (file) => {
    if (!editor || !file || !file.type.startsWith('image/')) {
      toast({
        title: "❌ Tipo de archivo no válido",
        description: "Por favor, selecciona un archivo de imagen.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Subiendo imagen..." });

    try {
      const imageUrl = await uploadPostImage(supabase, file);
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
        toast({ title: "✅ Imagen subida correctamente" });
      } else {
        throw new Error("No se pudo obtener la URL de la imagen.");
      }
    } catch (error) {
      toast({
        title: "❌ Error al subir la imagen",
        description: error.message || "Ocurrió un problema al contactar el servidor de almacenamiento.",
        variant: "destructive",
      });
    }
  }, [editor, toast, supabase]);
  
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  useEffect(() => {
    if (getEditor && editor) getEditor(editor);
  }, [editor, getEditor]);

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, true);
    }
  }, [content, editor]);

  return (
    <div className="w-full">
      <TiptapToolbar 
        editor={editor} 
        onAiAction={onAiAction} 
        onImageUpload={handleImageUpload} 
        onGenerateContent={onGenerateContent} 
        onInternalLink={onInternalLink} 
        onSuggestLinks={onSuggestLinks} 
      />

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-background border border-border rounded-lg p-1 flex items-center gap-1 shadow-xl"
          shouldShow={({ state, from, to }) => {
            const { empty } = state.selection;
            return from !== to && !empty;
          }}
        >
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-accent ${editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}`}>
            <Heading1 className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-accent ${editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}`}>
            <Heading2 className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-accent ${editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}`}>
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-muted-foreground mx-1" />
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-accent ${editor.isActive('bold') ? 'bg-accent' : ''}`}>
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-accent ${editor.isActive('italic') ? 'bg-accent' : ''}`}>
            <Italic className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-accent ${editor.isActive('underline') ? 'bg-accent' : ''}`}>
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-muted-foreground mx-1" />
          <button onClick={setLink} className={`p-2 rounded hover:bg-accent ${editor.isActive('link') ? 'bg-accent' : ''}`}>
            <LinkIcon className="w-4 h-4" />
          </button>
          <button onClick={onInternalLink} className="p-2 rounded hover:bg-accent">
            <Link2 className="w-4 h-4" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded hover:bg-accent">
                <PaintBucket className="w-4 h-4" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onMouseDown={(e) => e.preventDefault()} className="w-auto p-2">
              <div className="grid grid-cols-6 gap-1">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => editor.chain().focus().setColor(color.value).run()}
                    className="w-6 h-6 rounded-sm border border-border"
                    style={{ backgroundColor: color.value }}
                    aria-label={color.label}
                  />
                ))}
              </div>
              <input
                  type="color"
                  onInput={event => editor.chain().focus().setColor(event.target.value).run()}
                  value={editor.getAttributes('textStyle').color || '#ffffff'}
                  className="w-full h-8 bg-transparent border-none cursor-pointer mt-2"
                />
            </DropdownMenuContent>
          </DropdownMenu>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
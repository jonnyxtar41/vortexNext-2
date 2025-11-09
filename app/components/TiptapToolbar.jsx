import React, { useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered,
  Quote, Code,
  Undo, Redo,
  Link, Link2,
  Image as ImageIcon, Youtube,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Sparkles,
  Table, Columns, Rows, Merge, Split, Trash2, PaintBucket, EyeOff
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/app/components/ui/dropdown-menu";
import { Button } from '@/app/components/ui/button';

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

const TiptapToolbar = ({ editor, onAiAction, onImageUpload, onGenerateContent, onInternalLink, onSuggestLinks }) => {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const addYoutubeVideo = () => {
    const url = prompt('Ingresa la URL de YouTube');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) onImageUpload(file);
    };
    input.click();
  };

  const ToolbarButton = ({ command, args = [], icon, tooltip, isActiveCheck, canCheck, disabledCondition }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain()[command](...args).run()}
          disabled={disabledCondition ?? (canCheck ? !editor.can()[canCheck]() : false)}
          className={`p-2 rounded transition-colors hover:bg-accent/20 ${editor.isActive(isActiveCheck || command, ...args) ? 'is-active bg-accent text-accent-foreground' : ''}`}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent><p>{tooltip}</p></TooltipContent>
    </Tooltip>
  );

 return (
    <div className="border border-input bg-transparent rounded-t-lg p-2 flex flex-wrap items-center gap-1">
      <ToolbarButton command="toggleBold" icon={<Bold className="w-4 h-4" />} tooltip="Negrita" isActiveCheck="bold" />
      <ToolbarButton command="toggleItalic" icon={<Italic className="w-4 h-4" />} tooltip="Cursiva" isActiveCheck="italic" />
      <ToolbarButton command="toggleUnderline" icon={<UnderlineIcon className="w-4 h-4" />} tooltip="Subrayado" isActiveCheck="underline" />
      <ToolbarButton command="toggleStrike" icon={<Strikethrough className="w-4 h-4" />} tooltip="Tachado" isActiveCheck="strike" />

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="toggleHeading" args={[{ level: 1 }]} icon={<Heading1 className="w-4 h-4" />} tooltip="Encabezado 1" isActiveCheck="heading" />
      <ToolbarButton command="toggleHeading" args={[{ level: 2 }]} icon={<Heading2 className="w-4 h-4" />} tooltip="Encabezado 2" isActiveCheck="heading" />
      <ToolbarButton command="toggleHeading" args={[{ level: 3 }]} icon={<Heading3 className="w-4 h-4" />} tooltip="Encabezado 3" isActiveCheck="heading" />
      <ToolbarButton command="setParagraph" icon={<Pilcrow className="w-4 h-4" />} tooltip="Párrafo" isActiveCheck="paragraph" />

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="toggleBulletList" icon={<List className="w-4 h-4" />} tooltip="Lista de viñetas" isActiveCheck="bulletList" />
      <ToolbarButton command="toggleOrderedList" icon={<ListOrdered className="w-4 h-4" />} tooltip="Lista ordenada" isActiveCheck="orderedList" />
      <ToolbarButton command="toggleBlockquote" icon={<Quote className="w-4 h-4" />} tooltip="Cita" isActiveCheck="blockquote" />
      <ToolbarButton command="toggleCodeBlock" icon={<Code className="w-4 h-4" />} tooltip="Bloque de código" isActiveCheck="codeBlock" />

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <Tooltip>
        <TooltipTrigger asChild><button onMouseDown={(e) => e.preventDefault()} onClick={setLink} className={`p-2 rounded transition-colors hover:bg-accent/20 ${editor.isActive('link') ? 'is-active bg-accent text-accent-foreground' : ''}`}><Link className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir enlace externo</p></TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInternalLink}
            className="p-2 rounded transition-colors hover:bg-accent/20"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enlace a otro recurso</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild><button onMouseDown={(e) => e.preventDefault()} onClick={handleImageClick} className="p-2 rounded transition-colors hover:bg-accent/20"><ImageIcon className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir imagen</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><button onMouseDown={(e) => e.preventDefault()} onClick={addYoutubeVideo} className="p-2 rounded transition-colors hover:bg-accent/20"><Youtube className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir video de YouTube</p></TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="setTextAlign" args={['left']} icon={<AlignLeft className="w-4 h-4" />} tooltip="Alinear a la izquierda" isActiveCheck={{ textAlign: 'left' }} />
      <ToolbarButton command="setTextAlign" args={['center']} icon={<AlignCenter className="w-4 h-4" />} tooltip="Centrar" isActiveCheck={{ textAlign: 'center' }} />
      <ToolbarButton command="setTextAlign" args={['right']} icon={<AlignRight className="w-4 h-4" />} tooltip="Alinear a la derecha" isActiveCheck={{ textAlign: 'right' }} />
      <ToolbarButton command="setTextAlign" args={['justify']} icon={<AlignJustify className="w-4 h-4" />} tooltip="Justificar" isActiveCheck={{ textAlign: 'justify' }} />

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8">
                <PaintBucket className="w-4 h-4" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Color de texto</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onMouseDown={(e) => e.preventDefault()} className="p-2">
          <div className="p-1">
            <label className="text-sm font-medium">Personalizado</label>
            <input
              type="color"
              onInput={event => editor.chain().focus().setColor(event.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#ffffff'}
              className="w-full h-8 bg-transparent border-none cursor-pointer mt-1"
            />
          </div>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-6 gap-1 p-1">
            {PREDEFINED_COLORS.map((color) => (
              <Tooltip key={color.value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setColor(color.value).run()}
                    className="w-6 h-6 rounded-sm border border-border"
                    style={{ backgroundColor: color.value }}
                    aria-label={color.label}
                  />
                </TooltipTrigger>
                <TooltipContent>{color.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8">
                <Table className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Herramientas de Tabla</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onMouseDown={(e) => e.preventDefault()}>
          <DropdownMenuItem onSelect={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table className="w-4 h-4 mr-2" />Insertar Tabla</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}><Columns className="w-4 h-4 mr-2" />Añadir Columna Antes</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}><Columns className="w-4 h-4 mr-2" />Añadir Columna Después</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}><Trash2 className="w-4 h-4 mr-2" />Eliminar Columna</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}><Rows className="w-4 h-4 mr-2" />Añadir Fila Antes</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}><Rows className="w-4 h-4 mr-2" />Añadir Fila Después</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}><Trash2 className="w-4 h-4 mr-2" />Eliminar Fila</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}><Trash2 className="w-4 h-4 mr-2 text-destructive" />Eliminar Tabla</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}><Merge className="w-4 h-4 mr-2" />Combinar Celdas</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}><Split className="w-4 h-4 mr-2" />Dividir Celda</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderRow().run()} disabled={!editor.can().toggleHeaderRow()}><Rows className="w-4 h-4 mr-2" />Alternar Fila de Encabezado</DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              const { invisible } = editor.getAttributes('table');
              editor.chain().focus().updateAttributes('table', { invisible: !invisible }).run();
            }}
            disabled={!editor.isActive('table')}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Alternar Bordes Visibles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                onMouseDown={(e) => e.preventDefault()} 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={!editor.isActive('table')}
              >
                <PaintBucket className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Color de fondo de celda</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onMouseDown={(e) => e.preventDefault()} className="p-2">
          <div className="p-1">
            <label className="text-sm font-medium">Personalizado</label>
            <input
              type="color"
              onInput={event => editor.chain().focus().setCellAttribute('backgroundColor', event.target.value).run()}
              className="w-full h-8 bg-transparent border-none cursor-pointer mt-1"
            />
          </div>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-6 gap-1 p-1">
            {PREDEFINED_COLORS.map((color) => (
              <Tooltip key={color.value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', color.value).run()}
                    className="w-6 h-6 rounded-sm border border-border"
                    style={{ backgroundColor: color.value }}
                    aria-label={color.label}
                  />
                </TooltipTrigger>
                <TooltipContent>{color.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <DropdownMenuSeparator />
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', null).run()}
          >
            Eliminar color
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* New Dropdown for Border Style */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                onMouseDown={(e) => e.preventDefault()} 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={!editor.isActive('table')}
              >
                <Table className="w-4 h-4" /> {/* Using Table icon for now, can change later */}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Estilo de borde de celda</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onMouseDown={(e) => e.preventDefault()} className="p-2">
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'solid').run()}>Sólido</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'dotted').run()}>Punteado</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'dashed').run()}>Discontinuo</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'double').run()}>Doble</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'groove').run()}>Surco</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'ridge').run()}>Relieve</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'inset').run()}>Interior</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', 'outset').run()}>Exterior</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => editor.chain().focus().setCellAttribute('borderStyle', null).run()}>Eliminar estilo de borde</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="undo" icon={<Undo className="w-4 h-4" />} canCheck="undo" tooltip="Deshacer" />
      <ToolbarButton command="redo" icon={<Redo className="w-4 h-4" />} canCheck="redo" tooltip="Rehacer" />

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      {onAiAction && <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8">
                <Sparkles className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Asistente de IA</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onMouseDown={(e) => e.preventDefault()}>
          <DropdownMenuItem onSelect={onGenerateContent}>Generar contenido con prompt...</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('improve-writing')}>Mejorar escritura</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('fix-grammar')}>Corregir gramática</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('make-shorter')}>Hacer más corto</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('make-longer')}>Hacer más largo</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>}

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onSuggestLinks}
            className="p-2 rounded transition-colors hover:bg-accent/20"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sugerir enlaces internos con IA</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TiptapToolbar;
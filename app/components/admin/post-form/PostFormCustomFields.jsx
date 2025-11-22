// app/components/admin/post-form/PostFormCustomFields.jsx
'use client';

import React from 'react';
import  Button  from '@/app/components/ui/button'; // Adjusted path
import  Input  from '@/app/components/ui/input'; // Adjusted path
import { Trash2, PlusCircle } from 'lucide-react';
import  Label  from '@/app/components/ui/label'; // Adjusted path

const PostFormCustomFields = ({ customFields, setCustomFields }) => {
    const handleAddField = () => {
        setCustomFields([...customFields, { key: '', value: '' }]);
    };

    const handleRemoveField = (index) => {
        const newFields = customFields.filter((_, i) => i !== index);
        setCustomFields(newFields);
    };

    const handleFieldChange = (index, part, value) => {
        const newFields = [...customFields];
        newFields[index][part] = value;
        setCustomFields(newFields);
    };

    return (
        <div className="space-y-4 p-6 glass-effect rounded-lg">
            <h3 className="text-xl font-bold">Campos Personalizados</h3>
            <div className="space-y-4">
                {customFields.map((field, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                        <div>
                             <Label htmlFor={`field-key-${index}`} className="text-xs text-muted-foreground">Nombre del Campo</Label>
                            <Input
                                id={`field-key-${index}`}
                                type="text"
                                placeholder="Ej: Calificación"
                                value={field.key}
                                onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                                className="bg-input"
                            />
                        </div>
                        <div>
                             <Label htmlFor={`field-value-${index}`} className="text-xs text-muted-foreground">Valor</Label>
                            <Input
                                id={`field-value-${index}`}
                                type="text"
                                placeholder="Ej: 5/5"
                                value={field.value}
                                onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                className="bg-input"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveField(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                onClick={handleAddField}
                className="w-full"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Campo
            </Button>
        </div>
    );
};

export default PostFormCustomFields;

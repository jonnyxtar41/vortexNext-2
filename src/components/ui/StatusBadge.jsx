'use client';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        published: 'bg-green-500/20 text-green-400',
        draft: 'bg-yellow-500/20 text-yellow-400',
        scheduled: 'bg-blue-500/20 text-blue-400',
        pending_approval: 'bg-orange-500/20 text-orange-400',
    };
    const statusText = {
        published: 'Publicado',
        draft: 'Borrador',
        scheduled: 'Programado',
        pending_approval: 'Pendiente',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {statusText[status] || status}
        </span>
    );
};

export default StatusBadge;

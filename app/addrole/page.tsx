// app/utilisateurs/roles/page.tsx
import { PrismaClient } from '@prisma/client';
import { AjouterRoleModal } from './add';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

async function getRoles() {
  try {
    return await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            utilisateurs: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des rôles</h1>
        <AjouterRoleModal />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {roles.length > 0 ? (
            roles.map((role) => (
              <li key={role.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {role.nom}
                      </p>
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {role._count.utilisateurs} utilisateurs
                      </span>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <a
                        href={`/utilisateurs/roles/${role.id}`}
                        className="mr-2 px-3 py-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Détails
                      </a>
                      <a
                        href={`/utilisateurs/roles/${role.id}/modifier`}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Modifier
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {role.description || 'Aucune description'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {role.permissions.length} permissions
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              Aucun rôle trouvé
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
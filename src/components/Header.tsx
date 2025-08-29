import { BarChart2 } from "lucide-react";

export function Header() {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <BarChart2 className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Sistema de Estadísticas de Bomberos (SEB)
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
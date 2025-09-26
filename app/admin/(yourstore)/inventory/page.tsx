import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


const Inventory = () => {
    return (
        <div className='m-4 flex gap-2'>
            <div className="w-[200px] rounded bg-white p-3">
                <p className='text-gray-500 text-lg font-bold mb-4'>Warehouse</p>

                <p className='text-md font-bold text-green-500'>R<span className='text-3xl '>1.240090</span></p>
                <p>Value of Stock</p>
            </div>

            <div className="w-full rounded bg-white p-3">
                <p className='text-gray-500 text-lg font-bold mb-4'>Instock</p>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Name</TableHead>
                            <TableHead>In stock</TableHead>
                            <TableHead>Avg 30d order</TableHead>
                            <TableHead>Unit price</TableHead>
                            <TableHead className="text-right">Stock value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Shirt</TableCell>
                            <TableCell>20</TableCell>
                            <TableCell>10</TableCell>
                            <TableCell>R150</TableCell>
                            <TableCell className="text-right text-green-500">R2400</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className="font-medium">Shirt</TableCell>
                            <TableCell>20</TableCell>
                            <TableCell>10</TableCell>
                            <TableCell>R150</TableCell>
                            <TableCell className="text-right text-green-500">R2400</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className="font-medium">Shirt</TableCell>
                            <TableCell>20</TableCell>
                            <TableCell>10</TableCell>
                            <TableCell>R150</TableCell>
                            <TableCell className="text-right text-green-500">R2400</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className="font-medium">Shirt</TableCell>
                            <TableCell>20</TableCell>
                            <TableCell>10</TableCell>
                            <TableCell>R150</TableCell>
                            <TableCell className="text-right text-green-500">R2400</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default Inventory
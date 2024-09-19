import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout/Layout';
import { useGetAll } from '../Hooks/useGetAll';
import AllImg from '../assets/images/all-img.png';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import 'aos/dist/aos.css'; // Import AOS styles
import AOS from 'aos'; // Import AOS
import { ClipLoader } from "react-spinners"; // Import react-spinner
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios

const Products = () => {
    const [rows, setRows] = useState([]);
    const [catgList, setCatgList] = useState([]);
    const [currentCatg, setCurrentCatg] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const itemsPerPage = 6;

    const { data: Products, refetch: refetchProducts } = useGetAll({
        key: '/products/item/nt/',
        select: (data) => data.data || [],
        onSuccess: (data) => {
            console.log(data, "<----------ProductsIndex");
            setRows(data?.rows);
            setIsLoading(false);
        },
    });

    const { data: Category } = useGetAll({
        key: '/products/category/nt/',
        select: (data) => data?.data || [],  
        onSuccess: (data) => {
            console.log(data, "<----------CategoryIndex");
            setCatgList(data?.rows);
            setIsLoading(false);
        },
    });

    useEffect(() => {
        refetchProducts();
        setIsLoading(false);
    }, [currentCatg]);

    const filteredRows = useMemo(() => {
        return currentCatg
            ? rows?.filter(row => row?.category === currentCatg)
            : rows;
    }, [rows, currentCatg]);

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRows?.slice(start, start + itemsPerPage);
    }, [filteredRows, currentPage]);

    function getCategoryTitleById(id) {
        const category = catgList?.find(cat => cat.category_id === id);
        return category ? category?.category_title : "All";
    }

    const totalPages = Math.ceil(filteredRows?.length / itemsPerPage);

    const renderPaginationItems = () => {
        const items = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink onClick={() => setCurrentPage(i)} className={i === currentPage ? "border bg-gray-100" : ""}>{i}</PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                </PaginationItem>
            );
            items.push(
                <PaginationItem key={2}>
                    <PaginationLink onClick={() => setCurrentPage(2)}>2</PaginationLink>
                </PaginationItem>
            );
            items.push(
                <PaginationItem key={3}>
                    <PaginationLink onClick={() => setCurrentPage(3)}>3</PaginationLink>
                </PaginationItem>
            );
            items.push(
                <PaginationItem key="ellipsis1">
                    <PaginationEllipsis />
                </PaginationItem>
            );
            items.push(
                <PaginationItem key={totalPages - 1}>
                    <PaginationLink onClick={() => setCurrentPage(totalPages - 1)}>{totalPages - 1}</PaginationLink>
                </PaginationItem>
            );
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
            );
        }
        return items;
    };

    useEffect(() => {
        AOS.init({
            duration: 1000,
        });
    }, []);

    const handleDownload = async (brochureUrl) => {
        try {
            const response = await axios.get(brochureUrl, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'brochure.pdf'); // Adjust the default file name if needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };

    if (isLoading) {
        return (
            <div data-aos="fade-in" className="flex flex-col justify-center items-center h-screen">
                <ClipLoader color={"#84CC16"} size={100} />
                {/* <div  className="text-xl font-bold text-lime-600">Loading...</div> */}
            </div>
        );
    }

    return (
        <Layout>
            <div className="2xl:px-40 xl:px-8 mt-28">
                <div className="w-full flex flex-col gap-5 lg:flex-row shadow-lg p-2 ">
                    <div className="w-full lg:w-1/4 flex flex-row lg:flex-col overflow-x-auto h-full sticky top-20 lg:top-28 bg-white ">
                        <div
                            onClick={() => setCurrentCatg(null)}
                            className={`p-2 m-2 flex flex-col min-w-16 lg:flex-row items-center lg:align-middle content-center gap-2 hover:bg-gray-100 rounded-md cursor-pointer ${currentCatg == null ? 'bg-gray-200 ' : ''}`}
                        >
                            <img src={AllImg} alt="" className="w-4  md:w-8 lg:w-14" />
                            <h2 className="text-bold text-[10px] md:text-[14px] lg:text-lg h-full my-auto">All</h2>
                        </div>
                        {catgList?.map((catg) => (
                            <div
                                key={catg.category_id}
                                onClick={() => setCurrentCatg(catg.category_id)}
                                className={`p-2 m-2 flex flex-col min-w-16 lg:flex-row items-center lg:align-middle content-center gap-2 hover:bg-gray-100 rounded-md cursor-pointer ${currentCatg === catg.category_id ? 'bg-gray-200' : ''}`}
                            >
                                <img src={catg.image} alt="" className="w-4  md:w-8 lg:w-14" />
                                <h2 className="text-bold text-[10px] md:text-[14px] lg:text-lg h-full my-auto text-center lg:text-left">{catg.category_title}</h2>
                            </div>
                        ))}
                    </div>
                    <div className="w-full lg:w-3/4 h-full">
                        <h1 className="text-2xl text-lime-600 w-full text-center underline">
                            {getCategoryTitleById(currentCatg)}
                        </h1>
                        {/* <ScrollArea className="rounded-md border" style={{ height: '70vh' }}> */}
                            {paginatedRows?.map((row) => (
                                <div key={row.item_id} className="grid grid-cols-4 px-4 py-2 shadow-lg p-4 m-3 gap-5">
                                    <div className=" col-span-4 md:col-span-1 flex flex-col align-middle min-h-60 content-center justify-around">
                                        <img src={row.image} alt="" className="w-auto " />
                                    </div>
                                    <div className="col-span-4 md:col-span-3 md:py-8 flex flex-col align-middle content-center justify-around">
                                        <div>
                                            <h2 className="text-xl font-semibold text-lime-600">{row.item_title}</h2>
                                            <p><span className="font-semibold">Desc: </span>{row.item_desc}</p>
                                            <p><span className="font-semibold">Created At: </span>{new Date(row.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="">
                                            {row.brochure && (
                                                <button
                                                    onClick={() => handleDownload(row.brochure)}
                                                    className="text-white bg-lime-600 hover:bg-sky-600 inline-flex items-center justify-center w-auto px-4 py-1 shadow-xl rounded-xl"
                                                >
                                                    Download Brochure
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Pagination>
                                <PaginationContent>
                                    {currentPage > 1 && (
                                        <PaginationItem>
                                            <PaginationPrevious onClick={() => setCurrentPage(page => Math.max(page - 1, 1))} />
                                        </PaginationItem>
                                    )}
                                    {renderPaginationItems()}
                                    {currentPage < totalPages && (
                                        <PaginationItem>
                                            <PaginationNext onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))} />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        {/* </ScrollArea> */}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Products;
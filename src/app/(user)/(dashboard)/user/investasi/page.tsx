/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

interface Investor {
  id_investor: string;
  nama_investor: string;
  investasi: number;
  note?: string;
  id_ide: number;
  status: string;
  id_owner: string;
  id: number;
}

export default function Page() {
  const userId = Cookies.get('userId');

  const { data: investor = [] } = useSWR<Investor[]>(process.env.NEXT_PUBLIC_API_BASE_URL + `/getallinvestor/allinvestor/${userId}`, fetcher);

  const [ideaData, setIdeaData] = useState<{ [key: number]: { image: string; title: string } }>({});
  const [ownerData, setOwnerData] = useState<{ [key: string]: { email: string; no_hp: string } }>({});

  console.log(investor);

  useEffect(() => {
    const fetchData = async () => {
      const ideaResults: { [key: number]: { image: string; title: string } } = {};
      const ownerResults: { [key: string]: { email: string; no_hp: string } } = {};

      await Promise.all(
        investor.map(async (invest) => {
          try {
            // Fetch data ide
            const ideaRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/idea/${invest.id_ide}`);
            if (ideaRes.ok) {
              const idea = await ideaRes.json();
              ideaResults[invest.id_ide] = {
                image: idea.image || '/default-image.jpg',
                title: idea.title || 'Judul Tidak Diketahui',
              };
            } else {
              ideaResults[invest.id_ide] = { image: '/default-image.jpg', title: 'Judul Tidak Diketahui' };
            }

            // Fetch data owner
            const ownerRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${invest.id_owner}`);
            if (ownerRes.ok) {
              const owner = await ownerRes.json();
              ownerResults[invest.id_owner] = {
                email: owner.email || 'Tidak tersedia',
                no_hp: owner.no_hp || 'Tidak tersedia',
              };
            } else {
              ownerResults[invest.id_owner] = { email: 'Tidak tersedia', no_hp: 'Tidak tersedia' };
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        })
      );

      setIdeaData(ideaResults);
      setOwnerData(ownerResults);
    };

    if (investor.length) fetchData();
  }, [investor]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Daftar Investasi</h1>
        <p className="text-slate-600 text-sm">Data investasi yang anda lakukan</p>
      </div>
      <div className="flex flex-col gap-3 max-w-3xl mt-8">
        {Array.isArray(investor) &&
          investor.map((invest, index) => (
            <div key={index} className="bg-white border items-center rounded-md p-2 flex justify-between max-sm:flex-col gap-4">
              <div className="flex sm:items-center gap-4 max-sm:flex-col w-full">
                <div>
                  <Image
                    src={ideaData[invest.id_ide]?.image || '/default-image.jpg'}
                    width={135}
                    height={100}
                    alt={ideaData[invest.id_ide]?.title || 'Judul Tidak Diketahui'}
                    className="rounded-md max-sm:w-full max-h-24 object-cover"
                    unoptimized
                  />
                </div>
                <div className="max-sm:ps-1">
                  <p className="font-medium">{ideaData[invest.id_ide]?.title || 'Judul Tidak Diketahui'}</p>
                  <p className="mt-1">
                    Jumlah Tawaran Investasi <span className="text-green-600 bg-green-600/10 rounded-md px-2 py-1 text-sm">Rp.{invest.investasi}</span>
                  </p>
                  <div>
                    <Dialog>
                      <DialogTrigger>
                        <button className="text-blue-600 text-sm cursor-pointer hover:underline">Lihat Detail</button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-start">Detail Investasi</DialogTitle>
                          <DialogClose />
                        </DialogHeader>
                        <div className="text-left">
                          <table className="table-auto w-full">
                            <tbody>
                              <tr>
                                <td className="pb-2">Judul Ide</td>
                                <td className="px-2">:</td>
                                <p className="font-medium">{ideaData[invest.id_ide]?.title || 'Judul Tidak Diketahui'}</p>
                              </tr>
                              <tr>
                                <td className="py-2">Jumlah</td>
                                <td className="px-2">:</td>
                                <td className="font-medium">Rp. {invest.investasi}</td>
                              </tr>
                              <tr>
                                <td className="py-2">Email</td>
                                <td className="px-2">:</td>
                                <td className="font-medium">{ownerData[invest.id_owner]?.email || 'Tidak tersedia'}</td>
                              </tr>
                              <tr>
                                <td className="py-2">No HP</td>
                                <td className="px-2">:</td>
                                <td className="font-medium">{ownerData[invest.id_owner]?.no_hp || 'Tidak tersedia'}</td>
                              </tr>
                            </tbody>
                          </table>
                          <p className="mt-2">Catatan</p>
                          <ScrollArea className="max-h-40 mt-2 pr-3">
                            <p className="text-sm text-slate-600 text-justify">{invest.note}</p>
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <div>
                <p className={`${invest.status === 'diterima' ? 'text-green-600 bg-green-600/10' : 'text-red-500 bg-red-500/10'} text-sm px-2 py-1 rounded-full h-max mr-4`}>{invest.status}</p>
              </div>
            </div>
          ))}
      </div>
      {investor.length === 0 || (investor as any).message ? <p className="text-center text-slate-400 w-full">Kamu belum melakukan investasi</p> : null}
    </div>
  );
}

import React, { useState } from 'react'
// Import Swiper React components
import { Navigation, Pagination, Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/virtual';
import './PreviewSwiper.css'

import PreviewItem from './PreviewItem';

const PreviewSwiper = ({ bitcoin, inscription }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Virtual]}
      slidesPerView={1}
      virtual
      navigation
    >
      {(bitcoin === 0 && inscription.length === 0) && (
        <SwiperSlide virtualIndex={0}>
          <PreviewItem item={undefined} type='null' />
        </SwiperSlide>
      )}
      {bitcoin !== 0 && (
        <SwiperSlide virtualIndex={1}>
          <PreviewItem item={bitcoin} type='bitcoin' />
        </SwiperSlide>
        )}
      {inscription && inscription.map((item, index) => (
        <SwiperSlide virtualIndex={index+2}>
          <PreviewItem key={index} item={item} type='inscription' />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default PreviewSwiper
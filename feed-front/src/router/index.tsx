import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import Home from '../pages/Home'
import Error from '../pages/Error'
import User from '../pages/User'
import Focus from '@/pages/Focus'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Message from '../pages/Message'
import Notice from '../pages/Notice'
import Revise from '@/pages/Revise'
import App from '@/pages/App'
import Post from '@/pages/Post'
import Search from '../pages/Search'
import SearchDetail from '@/pages/SearchDetail'
import Dialogue from '@/pages/Dialogue'

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/message" element={<Message />} />
          <Route path="/message/:account" element={<Dialogue />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/user/:account" element={<User />} />
          <Route path="/search/detail" element={<SearchDetail />} />
          <Route path="/focus/:account" element={<Focus />} />
          <Route path="/revise" element={<Revise />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  )
}
export default observer(Router)

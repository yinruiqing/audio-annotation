<template>
  <div class="small">
    <el-dropdown>
      <el-button type="primary">
        Menu<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in slelctOptions" :key="item.id">{{item.value}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'FileMenu',
  data () {
    return {
      slelctOptions: [{
        value: 'export all annotation',
        id: '001'
      },
      {
        value: 'export chosen annotation',
        id: '002'
      }]
    }
  }
}
</script>

<style scoped>
.el-dropdown {
    vertical-align: top;
  }
  .el-dropdown + .el-dropdown {
    margin-left: 15px;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
.small{
  width:100px;
  flex-wrap:wrap;
}
</style>
